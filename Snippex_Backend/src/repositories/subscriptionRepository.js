const pool = require('../config/database')
const userRepository = require('./userRepository')
const {
  deriveSubscriptionPlanFromText,
  resolveSubscriptionStatusFromYampi,
  computeCurrentPeriodEnd,
} = require('../services/subscriptionLifecycle')

async function ensureUserSubscription(userId) {
  await pool.query(
    `
      INSERT INTO user_subscriptions (user_id, plan_id, billing_cycle, status)
      VALUES ($1, 'free', NULL, 'free')
      ON CONFLICT (user_id) DO NOTHING
    `,
    [userId]
  )

  return getSubscriptionByUserId(userId)
}

async function getSubscriptionByUserId(userId) {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM user_subscriptions
      WHERE user_id = $1
    `,
    [userId]
  )

  return rows[0] ?? null
}

async function getSubscriptionByEmail(email) {
  const user = await userRepository.findUserByEmail(email)
  if (!user) return null

  return getSubscriptionByUserId(user.id)
}

async function upsertCheckoutIntent({ userId, planId, billingCycle, checkoutUrl }) {
  const { rows } = await pool.query(
    `
      INSERT INTO user_subscriptions (
        user_id, plan_id, billing_cycle, status, checkout_url, cancel_at_period_end, updated_at
      )
      VALUES ($1, $2, $3, 'pending_payment', $4, FALSE, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        billing_cycle = EXCLUDED.billing_cycle,
        status = EXCLUDED.status,
        checkout_url = EXCLUDED.checkout_url,
        cancel_at_period_end = FALSE,
        updated_at = NOW()
      RETURNING *
    `,
    [userId, planId, billingCycle, checkoutUrl]
  )

  return rows[0]
}

async function updateSubscriptionForUser(userId, updates) {
  const fields = []
  const values = []
  let index = 1

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${index}`)
    values.push(value)
    index += 1
  }

  fields.push(`updated_at = NOW()`)

  const { rows } = await pool.query(
    `
      UPDATE user_subscriptions
      SET ${fields.join(', ')}
      WHERE user_id = $${index}
      RETURNING *
    `,
    [...values, userId]
  )

  return rows[0] ?? null
}

async function syncSubscriptionFromYampiWebhook(payload) {
  const { customerEmail, purchaseText, event, orderStatus, resourceId, orderNumber } = payload
  if (!customerEmail) return null

  const user = await userRepository.findUserByEmail(customerEmail)
  if (!user) return null

  const currentSubscription = await getSubscriptionByUserId(user.id)
  const textMatch = deriveSubscriptionPlanFromText(purchaseText)
  const planId = currentSubscription?.plan_id && currentSubscription.plan_id !== 'free'
    ? currentSubscription.plan_id
    : textMatch.planId ?? currentSubscription?.plan_id ?? 'free'
  const billingCycle = currentSubscription?.billing_cycle ?? textMatch.billingCycle ?? null
  const status = resolveSubscriptionStatusFromYampi({ event, orderStatus }) ?? currentSubscription?.status ?? 'pending_payment'

  const currentPeriodEnd =
    status === 'active' && billingCycle
      ? computeCurrentPeriodEnd(billingCycle, new Date())
      : currentSubscription?.current_period_end ?? null

  const { rows } = await pool.query(
    `
      INSERT INTO user_subscriptions (
        user_id, plan_id, billing_cycle, status, checkout_url,
        yampi_order_id, yampi_order_number, yampi_customer_email,
        cancel_at_period_end, current_period_end, activated_at, canceled_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, COALESCE($5, $6),
        $7, $8, $9,
        COALESCE($10, FALSE), $11, $12, $13, NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        plan_id = COALESCE(EXCLUDED.plan_id, user_subscriptions.plan_id),
        billing_cycle = COALESCE(EXCLUDED.billing_cycle, user_subscriptions.billing_cycle),
        status = EXCLUDED.status,
        checkout_url = COALESCE(EXCLUDED.checkout_url, user_subscriptions.checkout_url),
        yampi_order_id = COALESCE(EXCLUDED.yampi_order_id, user_subscriptions.yampi_order_id),
        yampi_order_number = COALESCE(EXCLUDED.yampi_order_number, user_subscriptions.yampi_order_number),
        yampi_customer_email = COALESCE(EXCLUDED.yampi_customer_email, user_subscriptions.yampi_customer_email),
        cancel_at_period_end = COALESCE(EXCLUDED.cancel_at_period_end, user_subscriptions.cancel_at_period_end),
        current_period_end = COALESCE(EXCLUDED.current_period_end, user_subscriptions.current_period_end),
        activated_at = COALESCE(EXCLUDED.activated_at, user_subscriptions.activated_at),
        canceled_at = COALESCE(EXCLUDED.canceled_at, user_subscriptions.canceled_at),
        updated_at = NOW()
      RETURNING *
    `,
    [
      user.id,
      planId,
      billingCycle,
      status,
      currentSubscription?.checkout_url ?? null,
      currentSubscription?.checkout_url ?? null,
      resourceId ?? null,
      orderNumber ?? null,
      customerEmail,
      false,
      currentPeriodEnd,
      status === 'active' ? new Date() : null,
      status === 'inactive' ? new Date() : null,
    ]
  )

  return rows[0] ?? null
}

module.exports = {
  ensureUserSubscription,
  getSubscriptionByUserId,
  getSubscriptionByEmail,
  upsertCheckoutIntent,
  updateSubscriptionForUser,
  syncSubscriptionFromYampiWebhook,
}
