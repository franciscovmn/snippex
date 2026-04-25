const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necessário para o Supabase
  },
})

pool.on('connect', () => {
  console.log('✅ Conectado ao Postgres (Supabase)')
})

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o Postgres:', err)
  process.exit(-1)
})

module.exports = pool
