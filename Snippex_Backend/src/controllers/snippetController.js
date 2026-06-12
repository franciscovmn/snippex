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

    // Dispara o enriquecimento por IA (n8n) em background — sem await, não bloqueia a resposta
    triggerN8nEnrichment(snippet)

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
// GET /snippets/saved (snippets salvos pelo usuário)
// ─────────────────────────────────────────────
async function listSaved(req, res) {
  try {
    const userId = req.user.id
    const snippets = await repo.getSavedSnippetsByUser(userId)
    return res.json(snippets)
  } catch (err) {
    console.error('[listSaved snippets]', err)
    return res.status(500).json({ error: 'Erro ao buscar snippets salvos.' })
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

    // Regenera explicação IA só se o código realmente foi alterado.
    if (updated.code_changed) triggerN8nEnrichment(updated)

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
// POST /snippets/:id/save
// ─────────────────────────────────────────────
async function save(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const saved = await repo.saveSnippetForUser(userId, id)

    if (!saved) {
      return res.status(404).json({ error: 'Snippet não encontrado ou indisponível para salvar.' })
    }

    return res.status(200).json({ status: 'saved', snippet_id: saved.snippet_id })
  } catch (err) {
    console.error('[save snippet]', err)
    return res.status(500).json({ error: 'Erro ao salvar snippet.' })
  }
}

// ─────────────────────────────────────────────
// DELETE /snippets/:id/save
// ─────────────────────────────────────────────
async function unsave(req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    await repo.unsaveSnippetForUser(userId, id)

    return res.status(204).send()
  } catch (err) {
    console.error('[unsave snippet]', err)
    return res.status(500).json({ error: 'Erro ao remover snippet salvo.' })
  }
}

// ─────────────────────────────────────────────
// Helper: dispara o webhook do n8n (fire-and-forget)
// Gera explicação + sugestões via IA e atualiza a linha no Supabase.
// ─────────────────────────────────────────────
function triggerN8nEnrichment(snippet) {
  // Proteção de redundância: só dispara se ainda não houver explicação.
  // (O workflow já é idempotente, mas isso evita uma chamada desnecessária.)
  if (snippet.explanation && String(snippet.explanation).trim() !== '') return

  const webhookUrl = process.env.N8N_WEBHOOK_SNIPPEX_ENRICH
  if (!webhookUrl) {
    console.error('[n8n] N8N_WEBHOOK_SNIPPEX_ENRICH não configurada; enriquecimento IA ignorado.')
    return
  }

  // Sem await no chamador: erros só são logados e nunca quebram a UX.
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: snippet.id,
      type: snippet.type,
      code: snippet.code,
      language: snippet.language,
    }),
  }).catch((err) => {
    console.error(`[n8n] Falha ao disparar webhook para snippet ${snippet.id}:`, err.message)
  })
}

module.exports = { create, listPublic, listMine, listSaved, getOne, listByTag, update, remove, save, unsave }
