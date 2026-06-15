const pool = require('../config/database')

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Cria um novo snippet no banco.
 * tags e suggestions são arrays de string (TEXT[]).
 */
async function createSnippet({ userId, title, type, language, code, visibility, tags, suggestions, teamId }) {
  const query = `
    INSERT INTO snippets (user_id, title, type, language, code, is_public, visibility, team_id, tags, suggestions)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `
  // is_public continua sendo preenchido para compatibilidade com código existente
  const isPublic = visibility === 'PUBLIC'

  const values = [
    userId,
    title,
    type ?? 'code',
    language ?? null,
    code,
    isPublic,
    visibility ?? 'PUBLIC',
    teamId ?? null,
    tags ?? [],
    suggestions ?? [],
  ]

  const { rows } = await pool.query(query, values)
  return rows[0]
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Retorna snippets públicos para o feed da comunidade.
 * Suporta paginação por cursor (offset simples para o MVP).
 */

async function getPublicSnippets({ limit = 20, offset = 0 }) {
  const query = `
    SELECT s.*, u.user_name, u.email
    FROM snippets s
    JOIN users u ON u.id = s.user_id
    WHERE s.visibility = 'PUBLIC'
      AND s.deleted_at IS NULL
    ORDER BY s.created_at DESC
    LIMIT $1 OFFSET $2
  `
  const { rows } = await pool.query(query, [limit, offset])
  return rows
}


async function getVisibleSnippets(userId, teamId, { limit = 20, offset = 0 }) {
  const query = `
    SELECT
      s.*,
      u.user_name,
      u.email,
      EXISTS (
        SELECT 1
        FROM saved_snippets ss
        WHERE ss.user_id = $1
          AND ss.snippet_id = s.id
      ) AS is_saved
    FROM snippets s
    JOIN users u ON u.id = s.user_id
    WHERE s.deleted_at IS NULL
      AND (
        s.visibility = 'PUBLIC'
        OR (s.visibility = 'TEAM'    AND s.team_id = $2)
        OR (s.visibility = 'PRIVATE' AND s.user_id = $1)
      )
    ORDER BY s.created_at DESC
    LIMIT $3 OFFSET $4
  `
  const { rows } = await pool.query(query, [userId, teamId, limit, offset])
  return rows
}
/**
 * Retorna todos os snippets do usuário autenticado (públicos + privados).
 */
async function getSnippetsByUser(userId) {
  const query = `
    SELECT *
    FROM snippets
    WHERE user_id = $1
      AND deleted_at IS NULL
    ORDER BY created_at DESC
  `
  const { rows } = await pool.query(query, [userId])
  return rows
}

/**
 * Retorna um snippet pelo ID.
 * Snippets privados só são retornados se o userId bater com o dono.
 */
async function getSnippetById(id, requestingUserId = null, requestingTeamId = null) {
  const query = `
    SELECT
      s.*,
      u.user_name,
      u.email,
      CASE
        WHEN $2::uuid IS NULL THEN false
        ELSE EXISTS (
          SELECT 1
          FROM saved_snippets ss
          WHERE ss.user_id = $2::uuid
            AND ss.snippet_id = s.id
        )
      END AS is_saved
    FROM snippets s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = $1
      AND s.deleted_at IS NULL
      AND (
        s.visibility = 'PUBLIC'
        OR (s.visibility = 'TEAM'    AND s.team_id = $3)
        OR (s.visibility = 'PRIVATE' AND s.user_id = $2)
      )
  `
  const { rows } = await pool.query(query, [id, requestingUserId, requestingTeamId])
  return rows[0] ?? null
}

async function getSavedSnippetsByUser(userId) {
  const query = `
    SELECT
      s.*,
      u.user_name,
      u.email,
      true AS is_saved,
      ss.created_at AS saved_at
    FROM saved_snippets ss
    JOIN snippets s ON s.id = ss.snippet_id
    JOIN users u ON u.id = s.user_id
    WHERE ss.user_id = $1
      AND s.deleted_at IS NULL
      AND (
        s.visibility = 'PUBLIC'
        OR (s.visibility = 'TEAM' AND s.team_id = (
          SELECT team_id FROM users WHERE id = $1
        ))
        OR (s.visibility = 'PRIVATE' AND s.user_id = $1)
      )
    ORDER BY ss.created_at DESC
  `
  const { rows } = await pool.query(query, [userId])
  return rows
}

async function saveSnippetForUser(userId, snippetId) {
  const query = `
    WITH viewer AS (
      SELECT team_id FROM users WHERE id = $1
    ),
    visible_snippet AS (
      SELECT s.id
      FROM snippets s, viewer v
      WHERE s.id = $2
        AND s.deleted_at IS NULL
        AND (
          s.visibility = 'PUBLIC'
          OR (s.visibility = 'TEAM' AND s.team_id = v.team_id)
          OR (s.visibility = 'PRIVATE' AND s.user_id = $1)
        )
    ),
    inserted AS (
      INSERT INTO saved_snippets (user_id, snippet_id)
      SELECT $1, id FROM visible_snippet
      ON CONFLICT (user_id, snippet_id) DO NOTHING
      RETURNING user_id, snippet_id, created_at
    )
    SELECT user_id, snippet_id, created_at FROM inserted
    UNION ALL
    SELECT ss.user_id, ss.snippet_id, ss.created_at
    FROM saved_snippets ss
    WHERE ss.user_id = $1
      AND ss.snippet_id = $2
      AND NOT EXISTS (SELECT 1 FROM inserted)
  `
  const { rows } = await pool.query(query, [userId, snippetId])
  return rows[0] ?? null
}

async function unsaveSnippetForUser(userId, snippetId) {
  const query = `
    DELETE FROM saved_snippets
    WHERE user_id = $1
      AND snippet_id = $2
    RETURNING user_id, snippet_id
  `
  const { rows } = await pool.query(query, [userId, snippetId])
  return rows[0] ?? null
}

/**
 * Busca snippets por tag (usando o índice GIN do array).
 */
async function getSnippetsByTag(tag, { limit = 20, offset = 0 }) {
  const query = `
    SELECT
      s.*,
      u.user_name
    FROM snippets s
    JOIN users u ON u.id = s.user_id
    WHERE $1 = ANY(s.tags)
      AND s.visibility = 'PUBLIC'
      AND s.deleted_at IS NULL
    ORDER BY s.created_at DESC
    LIMIT $2 OFFSET $3
  `
  const { rows } = await pool.query(query, [tag, limit, offset])
  return rows
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Atualiza um snippet. Só o dono pode editar (user_id = $7).
 * O trigger no banco cuida do updated_at automaticamente.
 * Retorna null se o snippet não pertencer ao usuário.
 */
async function updateSnippet(id, userId, { title, language, code, visibility, tags, suggestions }) {
  const isPublic = visibility ? visibility === 'PUBLIC' : undefined

  const query = `
    WITH existing AS (
      SELECT code
      FROM snippets
      WHERE id = $1
        AND user_id = $2
        AND deleted_at IS NULL
    ),
    changed AS (
      SELECT ($5::text IS NOT NULL AND $5::text IS DISTINCT FROM code) AS code_changed
      FROM existing
    )
    UPDATE snippets
    SET
      title       = COALESCE($3, title),
      language    = COALESCE($4, language),
      code        = COALESCE($5::text, code),
      visibility  = COALESCE($6, visibility),
      is_public   = COALESCE($7, is_public),
      tags        = COALESCE($8, tags),
      explanation = CASE WHEN changed.code_changed THEN NULL ELSE explanation END,
      suggestions = CASE WHEN changed.code_changed THEN '{}' ELSE COALESCE($9, suggestions) END
    FROM changed
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING snippets.*, changed.code_changed
  `
  const values = [id, userId, title, language, code, visibility ?? null, isPublic ?? null, tags, suggestions]
  const { rows } = await pool.query(query, values)
  return rows[0] ?? null
}


/**
 * Salva a explicação gerada pela IA.
 * Chamado de forma assíncrona após o create/update.
 */
async function saveExplanation(id, explanation) {
  const query = `
    UPDATE snippets
    SET explanation = $2
    WHERE id = $1
    RETURNING id, explanation
  `
  const { rows } = await pool.query(query, [id, explanation])
  return rows[0] ?? null
}

/**
 * Zera a explicação (e as sugestões) de um snippet do próprio usuário.
 * Usado no "tentar novamente": como o workflow do n8n é idempotente, é preciso
 * limpar explanation antes de redisparar para forçar a regeneração.
 * Retorna a linha completa (para montar o payload do webhook) ou null.
 */
async function resetExplanation(id, userId) {
  const query = `
    UPDATE snippets
    SET explanation = NULL,
        suggestions = '{}'
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING *
  `
  const { rows } = await pool.query(query, [id, userId])
  return rows[0] ?? null
}

// ─────────────────────────────────────────────
// DELETE (soft delete)
// ─────────────────────────────────────────────

/**
 * Soft delete: marca deleted_at em vez de apagar do banco.
 * Retorna null se o snippet não pertencer ao usuário.
 */
async function deleteSnippet(id, userId) {
  const query = `
    UPDATE snippets
    SET deleted_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING id
  `
  const { rows } = await pool.query(query, [id, userId])
  return rows[0] ?? null
}

module.exports = {
  createSnippet,
  getPublicSnippets,
  getVisibleSnippets, // para ter a comunidade com visibilidade
  getSnippetsByUser,
  getSnippetById,
  getSavedSnippetsByUser,
  getSnippetsByTag,
  saveSnippetForUser,
  unsaveSnippetForUser,
  updateSnippet,
  saveExplanation,
  resetExplanation,
  deleteSnippet,
}
