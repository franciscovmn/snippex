require('dotenv').config()
const express = require('express')
const cors = require('cors')

const snippetRoutes = require('./routes/snippetRoutes')
const userRoutes = require('./routes/userRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app  = express()
const PORT = process.env.PORT || 3000

// ── Middlewares globais ───────────────────────
app.use(cors())
app.use(express.json())

// ── Rotas ─────────────────────────────────────
app.use('/api/snippets', snippetRoutes)
app.use('/api/users', userRoutes)
app.use('/api/comments', commentRoutes)

// ── Health check ──────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ── Start ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})
