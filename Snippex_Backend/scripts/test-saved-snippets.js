require('dotenv').config()
const pool = require('../src/config/database')
const repo = require('../src/repositories/snippetRepository')
const { ensureSavedSnippetsTable } = require('../src/config/ensureSchema')

async function main() {
  await ensureSavedSnippetsTable()

  if (typeof repo.saveSnippetForUser !== 'function') {
    throw new Error('saveSnippetForUser is not implemented')
  }

  const { rows: users } = await pool.query('SELECT id FROM users ORDER BY created_at ASC LIMIT 2')
  if (users.length < 1) throw new Error('No users found')

  const ownerId = users[0].id
  const saverId = users[1]?.id ?? users[0].id

  const { rows } = await pool.query(
    `INSERT INTO snippets (user_id, title, type, language, code, is_public, visibility, tags, suggestions)
     VALUES ($1, 'Saved snippet behavior test', 'code', 'javascript', 'const saved = true;', true, 'PUBLIC', '{}', '{}')
     RETURNING id`,
    [ownerId],
  )

  const snippetId = rows[0].id

  try {
    const savedOnce = await repo.saveSnippetForUser(saverId, snippetId)
    const savedTwice = await repo.saveSnippetForUser(saverId, snippetId)
    const saved = await repo.getSavedSnippetsByUser(saverId)
    const detail = await repo.getSnippetById(snippetId, saverId, null)
    await repo.unsaveSnippetForUser(saverId, snippetId)
    const afterRemove = await repo.getSavedSnippetsByUser(saverId)

    console.log(JSON.stringify({
      savedOnce: Boolean(savedOnce),
      savedTwice: Boolean(savedTwice),
      savedListContainsSnippet: saved.some((snippet) => snippet.id === snippetId),
      detailIsSaved: detail?.is_saved,
      removedFromSaved: !afterRemove.some((snippet) => snippet.id === snippetId),
    }, null, 2))

    if (!savedOnce) throw new Error('first save failed')
    if (!savedTwice) throw new Error('second save should be idempotent')
    if (!saved.some((snippet) => snippet.id === snippetId)) throw new Error('saved list missing snippet')
    if (detail?.is_saved !== true) throw new Error('detail did not include is_saved=true')
    if (afterRemove.some((snippet) => snippet.id === snippetId)) throw new Error('snippet still saved after remove')
  } finally {
    await pool.query('DELETE FROM saved_snippets WHERE snippet_id = $1', [snippetId]).catch(() => {})
    await pool.query('UPDATE snippets SET deleted_at = NOW() WHERE id = $1', [snippetId])
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
