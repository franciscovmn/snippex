const pool = require('./database')

async function ensureSavedSnippetsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_snippets (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, snippet_id)
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_saved_snippets_user_created
    ON saved_snippets(user_id, created_at DESC)
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_saved_snippets_snippet
    ON saved_snippets(snippet_id)
  `)
}

async function ensureSchema() {
  await ensureSavedSnippetsTable()
}

module.exports = { ensureSchema, ensureSavedSnippetsTable }
