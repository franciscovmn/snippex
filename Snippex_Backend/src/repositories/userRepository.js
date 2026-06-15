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
    SELECT
      u.*,
      us.plan_id AS subscription_plan_id,
      us.billing_cycle AS subscription_billing_cycle,
      us.status AS subscription_status,
      us.checkout_url AS subscription_checkout_url,
      us.cancel_at_period_end AS subscription_cancel_at_period_end,
      us.current_period_end AS subscription_current_period_end,
      us.activated_at AS subscription_activated_at,
      us.canceled_at AS subscription_canceled_at
    FROM users u
    LEFT JOIN user_subscriptions us ON us.user_id = u.id
    WHERE u.email = $1
  `

  const result = await pool.query(query, [email])
  return result.rows[0]
}

async function findUserById(id) {
  const query = `
    SELECT
      u.*,
      us.plan_id AS subscription_plan_id,
      us.billing_cycle AS subscription_billing_cycle,
      us.status AS subscription_status,
      us.checkout_url AS subscription_checkout_url,
      us.cancel_at_period_end AS subscription_cancel_at_period_end,
      us.current_period_end AS subscription_current_period_end,
      us.activated_at AS subscription_activated_at,
      us.canceled_at AS subscription_canceled_at
    FROM users u
    LEFT JOIN user_subscriptions us ON us.user_id = u.id
    WHERE u.id = $1
  `

  const result = await pool.query(query, [id])
  return result.rows[0]
}

async function editProfile({ id, name, user_name, email }) {
  const query = `
    UPDATE users
    SET name = $2,
        user_name = $3,
        email = $4
    WHERE id = $1
  `;

  const values = [id, name, user_name, email];
  const result = await pool.query(query, values);
  return result;
}

async function changePassword({id, password}) {
  const query = `
    UPDATE users
    SET password = $2
    WHERE id = $1
  `

  const values = [id, password];
  const result = await pool.query(query, values);
  return result;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  editProfile,
  changePassword
}
