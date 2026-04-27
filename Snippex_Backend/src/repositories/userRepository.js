const pool = require('../config/database')

async function createUser({ name, user_name, email, password }) {
  const query = `
    INSERT INTO users (name, user_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, user_name, email, created_at
  `

  const values = [name, user_name, email, password]
  const result = await pool.query(query, values)

  return result.rows[0]
}

async function findUserByEmail(email) {
  const query = `
    SELECT * FROM users
    WHERE email = $1
  `

  const result = await pool.query(query, [email])
  return result.rows[0]
}

module.exports = {
  createUser,
  findUserByEmail
}