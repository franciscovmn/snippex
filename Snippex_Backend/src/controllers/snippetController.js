const repo = require('../repositories/snippetRepository')

// ─────────────────────────────────────────────
// POST /snippets
// ─────────────────────────────────────────────
async function create(req, res) {
  try {
    const userId = req.user.id // vem do middleware de autenticação
    const teamId = req.user.team_id
    const { title, type, language, code, visibility, tags, suggestions } = req.body

    // Validação básica
    if (!title || !code) {
      return res.status(400).json({ error: 'title e code são obrigatórios.' })
    }
    if (type === 'code' && !language) {
      return res.status(400).json({ error: 'language é obrigatório para snippets de código.' })
    }
    const VALID = ['PUBLIC', 'TEAM', 'PRIVATE']
    const resolvedVisibility = VALID.includes(visibility) ? visibility : 'PUBLIC'


    const snippet = await repo.createSnippet({
      userId, title, type, language, code, visibility: resolvedVisibility, teamId, tags, suggestions,
    })

    // Dispara geração da explicação IA em background (sem await — não bloqueia a resposta)
    generateExplanationInBackground(snippet.id, snippet.code)

    return res.status(201).json(snippet)
  } catch (err) {
    console.error('[create snippet]', err)
    return res.status(500).json({ error: 'Erro interno ao criar snippet.' })
  }
}

// ─────────────────────────────────────────────
// GET /snippets (feed público)
// ─────────────────────────────────────────────
async function listPublic(req, res) {
  try {
    const limit  = parseInt(req.query.limit)  || 20
    const offset = parseInt(req.query.offset) || 0

    // aqui,  Se autenticado, usa filtro completo, se anônimo, só PUBLIC
    if (req.user) {
      const snippets = await repo.getVisibleSnippets(req.user.id, req.user.team_id, { limit, offset })
      return res.json(snippets)
    }

    const snippets = await repo.getPublicSnippets({ limit, offset })
    return res.json(snippets)
  } catch (err) {
    console.error('[listPublic snippets]', err)
    return res.status(500).json({ error: 'Erro ao buscar snippets.' })
  }
}

// ─────────────────────────────────────────────
// GET /snippets/me (snippets do usuário logado)
// ─────────────────────────────────────────────
async function listMine(req, res) {
  try {
    const userId = req.user.id
    const snippets = await repo.getSnippetsByUser(userId)
    return res.json(snippets)
  } catch (err) {
    console.error('[listMine snippets]', err)
    return res.status(500).json({ error: 'Erro ao buscar seus snippets.' })
  }
}

// ─────────────────────────────────────────────
// GET /snippets/:id
// ─────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const { id } = req.params
    const requestingUserId = req.user?.id ?? null // pode ser rota pública
    const requestingTeamId = req.user?.team_id ?? null 

    const snippet = await repo.getSnippetById(id, requestingUserId, requestingTeamId)

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet não encontrado.' })
    }

    return res.json(snippet)
  } catch (err) {
    console.error('[getOne snippet]', err)
    return res.status(500).json({ error: 'Erro ao buscar snippet.' })
  }
}

// ─────────────────────────────────────────────
// GET /snippets/tag/:tag
// ─────────────────────────────────────────────
async function listByTag(req, res) {
  try {
    const { tag } = req.params
    const limit  = parseInt(req.query.limit)  || 20
    const offset = parseInt(req.query.offset) || 0

    const snippets = await repo.getSnippetsByTag(tag, { limit, offset })
    return res.json(snippets)
  } catch (err) {
    console.error('[listByTag snippets]', err)
    return res.status(500).json({ error: 'Erro ao buscar snippets por tag.' })
  }
}

// ─────────────────────────────────────────────
// PATCH /snippets/:id
// ─────────────────────────────────────────────
async function update(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const { title, language, code, visibility, tags, suggestions } = req.body

    const VALID = ['PUBLIC', 'TEAM', 'PRIVATE']
    const resolvedVisibility = visibility && VALID.includes(visibility) ? visibility : undefined

    const updated = await repo.updateSnippet(id, userId, {
      title, language, code, visibility: resolvedVisibility, tags, suggestions,
    })

    if (!updated) {
      return res.status(404).json({ error: 'Snippet não encontrado ou sem permissão.' })
    }

    // Regenera explicação IA só se o código foi alterado
    if (code) generateExplanationInBackground(updated.id, updated.code)

    return res.json(updated)
  } catch (err) {
    console.error('[update snippet]', err)
    return res.status(500).json({ error: 'Erro ao atualizar snippet.' })
  }
}

// ─────────────────────────────────────────────
// DELETE /snippets/:id
// ─────────────────────────────────────────────
async function remove(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const deleted = await repo.deleteSnippet(id, userId)

    if (!deleted) {
      return res.status(404).json({ error: 'Snippet não encontrado ou sem permissão.' })
    }

    return res.status(204).send() // No Content
  } catch (err) {
    console.error('[delete snippet]', err)
    return res.status(500).json({ error: 'Erro ao deletar snippet.' })
  }
}

// ─────────────────────────────────────────────
// Helper: gera explicação IA em background
// ─────────────────────────────────────────────
async function generateExplanationInBackground(snippetId, code) {
  try {
    // TODO: substituir pela chamada real à sua IA (OpenAI, Claude API, etc.)
    // Exemplo de estrutura:
    //
    // const explanation = await aiService.explain(code)
    // await repo.saveExplanation(snippetId, explanation)

    console.log(`[AI] Gerando explicação para snippet ${snippetId}...`)
  } catch (err) {
    console.error(`[AI] Falha ao gerar explicação para ${snippetId}:`, err)
    // Não propaga o erro — não deve quebrar o fluxo principal
  }
}

module.exports = { create, listPublic, listMine, getOne, listByTag, update, remove }
