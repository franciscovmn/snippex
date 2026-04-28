const express = require('express')
const router  = express.Router()
const snippetController = require('../controllers/snippetController')
const { authenticate, optionalAuth } = require('../middlewares/auth')

// ──────────────────────────────────────────────────────────
// Rotas PÚBLICAS (qualquer um acessa)
// ──────────────────────────────────────────────────────────

// Feed público — GET /api/snippets?limit=20&offset=0
router.get('/', snippetController.listPublic)

// Busca por tag — GET /api/snippets/tag/javascript
router.get('/tag/:tag', snippetController.listByTag)

// ──────────────────────────────────────────────────────────
// Rotas PRIVADAS (requer autenticação)
// ──────────────────────────────────────────────────────────

// Snippets do usuário logado — GET /api/snippets/me
router.get('/me', authenticate, snippetController.listMine)

// Detalhe de um snippet (optionalAuth: se logado, pode ver os próprios privados)
// GET /api/snippets/:id
router.get('/:id', optionalAuth, snippetController.getOne)

// Criar snippet — POST /api/snippets
router.post('/', authenticate, snippetController.create)

// Atualizar snippet — PATCH /api/snippets/:id
router.patch('/:id', authenticate, snippetController.update)

// Deletar snippet — DELETE /api/snippets/:id
router.delete('/:id', authenticate, snippetController.remove)

module.exports = router
