require('dotenv').config()
const pool = require('../src/config/database')
const repo = require('../src/repositories/snippetRepository')

async function main() {
  const { rows: users } = await pool.query('SELECT id FROM users ORDER BY created_at ASC LIMIT 1')
  if (!users[0]) throw new Error('No users found')

  const { rows } = await pool.query(
    `INSERT INTO snippets (user_id, title, type, language, code, is_public, visibility, explanation, tags, suggestions)
     VALUES ($1, 'Update code change test', 'code', 'javascript', 'const value = 1;', false, 'PRIVATE', 'old explanation', '{}', ARRAY['old suggestion']::text[])
     RETURNING id`,
    [users[0].id],
  )

  const id = rows[0].id

  try {
    const same = await repo.updateSnippet(id, users[0].id, { code: 'const value = 1;' })
    const changed = await repo.updateSnippet(id, users[0].id, { code: 'const value = 2;' })

    const { rows: finalRows } = await pool.query(
      'SELECT explanation, suggestions FROM snippets WHERE id = $1',
      [id],
    )

    console.log(JSON.stringify({
      sameCodeChanged: same.code_changed,
      changedCodeChanged: changed.code_changed,
      finalExplanation: finalRows[0].explanation,
      finalSuggestionsCount: finalRows[0].suggestions.length,
    }, null, 2))

    if (same.code_changed !== false) throw new Error('same-code update was marked as changed')
    if (changed.code_changed !== true) throw new Error('changed-code update was not marked as changed')
    if (finalRows[0].explanation !== null) throw new Error('explanation was not cleared after code change')
    if (finalRows[0].suggestions.length !== 0) throw new Error('suggestions were not cleared after code change')
  } finally {
    await pool.query('UPDATE snippets SET deleted_at = NOW() WHERE id = $1', [id])
  }
}

main()
  .catch((error) => {
    console.error(`${error.name}: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
