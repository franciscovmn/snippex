// Middleware de autenticação via JWT
// Aqui você pode usar o token do Supabase Auth ou qualquer JWT próprio

const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

/**
 * authenticate: bloqueia a rota se não houver token válido.
 * Popula req.user com { id, email }.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}

/**
 * optionalAuth: não bloqueia a rota, mas popula req.user se o token existir.
 * Usado em rotas que mostam conteúdo público mas têm comportamento extra se logado.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = { id: decoded.sub, email: decoded.email }
    } catch {
      // Token inválido — ignora e continua como anônimo
      req.user = null
    }
  } else {
    req.user = null
  }

  next()
}

module.exports = { authenticate, optionalAuth }
