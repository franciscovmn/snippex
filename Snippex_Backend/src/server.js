require('dotenv').config()
const express = require('express')
const cors = require('cors')

const snippetRoutes = require('./routes/snippetRoutes')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')
const yampiRoutes = require('./routes/yampiRoutes')
const { ensureSchema } = require('./config/ensureSchema')
const { buildCorsOptions } = require('./config/cors')

const app  = express()
const PORT = process.env.PORT || 3000

// ── Middlewares globais ───────────────────────
app.use(cors(buildCorsOptions(process.env.CORS_ORIGIN || '')))
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf?.length ? buf.toString('utf8') : ''
  },
}))

// ── Rotas ─────────────────────────────────────
app.use('/api/snippets', snippetRoutes)
app.use('/api/users', userRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/integrations/yampi', yampiRoutes)

// ── Health check ──────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ── Start ─────────────────────────────────────
ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Erro ao preparar schema do banco:', err)
    process.exit(1)
  })
