require('dotenv').config()
const { Pool } = require('pg')

const WEBHOOK_URL = process.env.N8N_WEBHOOK_SNIPPEX_ENRICH

if (!WEBHOOK_URL) {
  throw new Error('N8N_WEBHOOK_SNIPPEX_ENRICH is required')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const { rows: users } = await pool.query('SELECT id FROM users ORDER BY created_at ASC LIMIT 1')
  if (!users[0]) throw new Error('No users found')

  const { rows } = await pool.query(
    `INSERT INTO snippets (user_id, title, type, language, code, is_public, visibility, tags, suggestions)
     VALUES ($1, $2, $3, $4, $5, false, 'PRIVATE', '{}', '{}')
     RETURNING id, type, code, language`,
    [
      users[0].id,
      'Teste n8n enrichment',
      'code',
      'javascript',
      'function add(a, b) { return a + b; }',
    ],
  )

  const snippet = rows[0]
  console.log(JSON.stringify({ createdSnippetId: snippet.id }, null, 2))

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: snippet.id,
      type: snippet.type,
      code: snippet.code,
      language: snippet.language,
    }),
  })

  const responseBody = await response.text()
  console.log(JSON.stringify({ webhookStatus: response.status, webhookOk: response.ok, body: responseBody.slice(0, 500) }, null, 2))

  let enriched = null
  for (let attempt = 0; attempt < 12; attempt++) {
    const result = await pool.query(
      `SELECT id, explanation, suggestions
       FROM snippets
       WHERE id = $1`,
      [snippet.id],
    )
    const current = result.rows[0]
    if (current?.explanation && String(current.explanation).trim()) {
      enriched = current
      break
    }
    await sleep(5000)
  }

  await pool.query('UPDATE snippets SET deleted_at = NOW() WHERE id = $1', [snippet.id])

  if (!enriched) {
    throw new Error(`Snippet ${snippet.id} was not enriched before timeout`)
  }

  console.log(JSON.stringify({
    enrichedSnippetId: enriched.id,
    explanationLength: String(enriched.explanation).length,
    suggestionsCount: Array.isArray(enriched.suggestions) ? enriched.suggestions.length : 0,
    cleanedUp: true,
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(`${error.name}: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
