require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const snippetRoutes = require('./routes/snippetRoutes')

const app  = express()
const PORT = process.env.PORT || 3000

// ── Middlewares globais ───────────────────────
app.use(cors())
app.use(express.json())

// ── Rotas ─────────────────────────────────────
app.use('/api/snippets', snippetRoutes)

// ── Health check ──────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ── Start ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
