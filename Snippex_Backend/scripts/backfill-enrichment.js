/*
 * Backfill de enriquecimento por IA.
 *
 * Dispara o webhook do n8n para todos os snippets que ainda não têm uma
 * explicação válida (nulos, vazios ou com mensagem de fallback). Usado para
 * cobrir snippets criados antes da integração com o n8n.
 *
 * Rodar: npm run backfill:enrichment
 *
 * Seguro de rodar várias vezes: o workflow do n8n é idempotente e só os
 * snippets ainda sem explicação válida são selecionados a cada execução.
 */
require('dotenv').config()
const { Pool } = require('pg')

const WEBHOOK_URL = process.env.N8N_WEBHOOK_SNIPPEX_ENRICH
const SLEEP_MS = 1500
const REQUEST_TIMEOUT_MS = 120000 // o webhook é síncrono (espera o Gemini)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  if (!WEBHOOK_URL) {
    console.error('❌ N8N_WEBHOOK_SNIPPEX_ENRICH não configurada no .env. Abortando.')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  const { rows } = await pool.query(`
    SELECT id, type, code, language, explanation
    FROM snippets
    WHERE deleted_at IS NULL
      AND (
        explanation IS NULL
        OR explanation = ''
        OR explanation LIKE 'Falha ao gerar%'
        OR explanation LIKE 'Erro ao gerar%'
      )
    ORDER BY created_at ASC
  `)

  const total = rows.length
  console.log(`\n🔎 Encontrados ${total} snippets sem explicação válida.\n`)

  if (total === 0) {
    await pool.end()
    console.log('Nada a fazer. ✅')
    return
  }

  // Linhas com mensagem de fallback têm explanation não-vazio; o workflow
  // pularia (idempotência). Zera essas antes de redisparar para forçar a regeneração.
  const fallbackIds = rows
    .filter((r) => r.explanation && r.explanation.trim() !== '')
    .map((r) => r.id)

  if (fallbackIds.length > 0) {
    await pool.query(`UPDATE snippets SET explanation = NULL WHERE id = ANY($1)`, [fallbackIds])
    console.log(`↺ ${fallbackIds.length} snippet(s) com fallback tiveram explanation zerada para regenerar.\n`)
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < total; i++) {
    const snippet = rows[i]
    const pos = `[${i + 1}/${total}]`
    const lang = snippet.language || '—'

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: snippet.id,
          type: snippet.type,
          code: snippet.code,
          language: snippet.language,
        }),
        signal: controller.signal,
      })

      let bodyStatus = ''
      try {
        const data = await res.json()
        if (data && data.status) bodyStatus = ` (${data.status})`
      } catch (_) {
        /* corpo não-JSON: ignora */
      }

      console.log(`${pos} snippet ${snippet.id} (${lang}) → status ${res.status}${bodyStatus}`)
      if (res.status === 200) success++
      else failed++
    } catch (err) {
      const reason = err.name === 'AbortError' ? 'timeout' : err.message
      console.log(`${pos} snippet ${snippet.id} (${lang}) → FALHA (${reason})`)
      failed++
    } finally {
      clearTimeout(timeout)
    }

    if (i < total - 1) await sleep(SLEEP_MS)
  }

  await pool.end()

  console.log('\n──────── Resumo ────────')
  console.log(`Total processados: ${total}`)
  console.log(`Sucessos (HTTP 200 ok/skipped): ${success}`)
  console.log(`Falhas (timeout/500/etc.): ${failed}`)
  console.log('────────────────────────\n')
}

main().catch((err) => {
  console.error('Erro inesperado no backfill:', err)
  process.exit(1)
})
