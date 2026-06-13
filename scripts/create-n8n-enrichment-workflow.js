const fs = require('fs')

const cfg = JSON.parse(fs.readFileSync('.mcp.json', 'utf8')).mcpServers['n8n-mcp'].env
const baseUrl = cfg.N8N_API_URL.replace(/\/$/, '')
const geminiKey = process.env.GEMINI_API_KEY
const postgresCredentialId = process.env.N8N_POSTGRES_CREDENTIAL_ID
const postgresCredentialName = process.env.N8N_POSTGRES_CREDENTIAL_NAME || 'Snippex Supabase Postgres'

if (!geminiKey) {
  throw new Error('GEMINI_API_KEY is required')
}
if (!postgresCredentialId) {
  throw new Error('N8N_POSTGRES_CREDENTIAL_ID is required')
}

const normalizeCode = String.raw`const body = items[0].json.body ?? items[0].json;
const id = String(body.id ?? '').trim();
const code = String(body.code ?? '').trim();
const type = String(body.type ?? 'code').trim() || 'code';
const language = body.language == null ? null : String(body.language).trim();

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
  throw new Error('id must be a valid UUID');
}
if (!code) {
  throw new Error('code is required');
}

return [{ json: { id, type, code, language } }];`

const buildGeminiCode = [
  "const item = items[0].json;",
  "const prompt = [",
  "  'Analise este snippet do Snippex e responda somente em JSON válido, sem markdown.',",
  "  '',",
  "  'Tipo: ' + item.type,",
  "  'Linguagem: ' + (item.language || 'não informada'),",
  "  '',",
  "  'Conteúdo:',",
  "  '```',",
  "  item.code,",
  "  '```',",
  "  '',",
  "  'Formato obrigatório:',",
  "  '{',",
  "  '  \"explanation\": \"explicação curta em português, útil para desenvolvedores\",',",
  "  '  \"suggestions\": [\"3 a 5 sugestões práticas de melhoria\"]',",
  "  '}',",
  "].join('\\n');",
  "",
  "return [{",
  "  json: {",
  "    ...item,",
  "    geminiRequest: {",
  "      contents: [{ role: 'user', parts: [{ text: prompt }] }],",
  "      generationConfig: {",
  "        temperature: 0.2,",
  "        responseMimeType: 'application/json',",
  "      },",
  "    },",
  "  },",
  "}];",
].join('\n')

const parseGeminiCode = String.raw`const payload = $('Normalize Payload').first().json;
const response = items[0].json;
const text = response.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';

let parsed;
try {
  parsed = JSON.parse(text);
} catch (error) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini did not return JSON');
  parsed = JSON.parse(match[0]);
}

const explanation = String(parsed.explanation || '').trim();
const suggestions = Array.isArray(parsed.suggestions)
  ? parsed.suggestions.map((s) => String(s).trim()).filter(Boolean).slice(0, 5)
  : [];

if (!explanation) {
  throw new Error('Gemini response missing explanation');
}

const sqlString = (value) => "'" + String(value).replace(/\u0000/g, '').replace(/'/g, "''") + "'";
const suggestionsSql = suggestions.length
  ? 'ARRAY[' + suggestions.map(sqlString).join(',') + ']::text[]'
  : 'ARRAY[]::text[]';

return [{
  json: {
    id: payload.id,
    explanation,
    suggestions,
    status: 'ok',
    idSql: sqlString(payload.id),
    explanationSql: sqlString(explanation),
    suggestionsSql,
  },
}];`

const workflow = {
  name: 'Snippex AI Enrichment',
  nodes: [
    {
      parameters: {
        httpMethod: 'POST',
        path: 'snippex-ai-enrich',
        responseMode: 'lastNode',
        options: {},
      },
      id: 'webhook',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2.1,
      position: [0, 0],
      webhookId: 'snippex-ai-enrich',
    },
    {
      parameters: {
        mode: 'runOnceForAllItems',
        language: 'javaScript',
        jsCode: normalizeCode,
      },
      id: 'normalize',
      name: 'Normalize Payload',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [240, 0],
    },
    {
      parameters: {
        mode: 'runOnceForAllItems',
        language: 'javaScript',
        jsCode: buildGeminiCode,
      },
      id: 'build-gemini',
      name: 'Build Gemini Request',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [480, 0],
    },
    {
      parameters: {
        method: 'POST',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        sendHeaders: true,
        headerParameters: {
          parameters: [{ name: 'Content-Type', value: 'application/json' }],
        },
        sendBody: true,
        contentType: 'json',
        specifyBody: 'json',
        jsonBody: '={{ JSON.stringify($json.geminiRequest) }}',
        options: { timeout: 120000 },
      },
      id: 'gemini',
      name: 'Gemini Generate Content',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.4,
      position: [720, 0],
    },
    {
      parameters: {
        mode: 'runOnceForAllItems',
        language: 'javaScript',
        jsCode: parseGeminiCode,
      },
      id: 'parse',
      name: 'Parse Gemini Response',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [960, 0],
    },
    {
      parameters: {
        resource: 'database',
        operation: 'executeQuery',
        query: `UPDATE snippets
SET explanation = {{$json.explanationSql}},
    suggestions = {{$json.suggestionsSql}},
    updated_at = NOW()
WHERE id = {{$json.idSql}}::uuid
  AND deleted_at IS NULL
RETURNING id, explanation, suggestions;`,
        options: {
          queryBatching: 'independently',
        },
      },
      id: 'update',
      name: 'Update Snippet',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.6,
      position: [1200, 0],
      credentials: {
        postgres: {
          id: postgresCredentialId,
          name: postgresCredentialName,
        },
      },
    },
  ],
  connections: {
    Webhook: {
      main: [[{ node: 'Normalize Payload', type: 'main', index: 0 }]],
    },
    'Normalize Payload': {
      main: [[{ node: 'Build Gemini Request', type: 'main', index: 0 }]],
    },
    'Build Gemini Request': {
      main: [[{ node: 'Gemini Generate Content', type: 'main', index: 0 }]],
    },
    'Gemini Generate Content': {
      main: [[{ node: 'Parse Gemini Response', type: 'main', index: 0 }]],
    },
    'Parse Gemini Response': {
      main: [[{ node: 'Update Snippet', type: 'main', index: 0 }]],
    },
  },
  settings: {
    executionOrder: 'v1',
  },
}

async function main() {
  const response = await fetch(`${baseUrl}/api/v1/workflows`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': cfg.N8N_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflow),
  })

  const text = await response.text()
  if (!response.ok) {
    console.error(JSON.stringify({ status: response.status, statusText: response.statusText, body: text.slice(0, 1600) }, null, 2))
    process.exit(1)
  }

  const created = JSON.parse(text)
  console.log(JSON.stringify({ id: created.id, name: created.name, active: created.active, nodeCount: created.nodes?.length }, null, 2))
}

main().catch((error) => {
  console.error(`${error.name}: ${error.message}`)
  process.exit(1)
})
