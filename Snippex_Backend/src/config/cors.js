function parseAllowedOrigins(rawValue) {
  if (!rawValue) return []

  return rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function buildCorsOptions(rawAllowedOrigins) {
  const allowedOrigins = parseAllowedOrigins(rawAllowedOrigins)

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origin não permitida pelo CORS'), false)
    },
  }
}

module.exports = {
  parseAllowedOrigins,
  buildCorsOptions,
}
