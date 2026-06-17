const pool = require('../config/database')
const userRepository = require('./userRepository')
const subscriptionRepository = require('./subscriptionRepository')

async function recordWebhookEvent({ event, merchantAlias, resourceType, resourceId, customerId, payload, signature }) {
  await pool.query(
    `
      INSERT INTO yampi_webhook_events (
        event, merchant_alias, resource_type, resource_id, customer_id, payload, signature, processed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
      ON CONFLICT (signature) DO NOTHING
    `,
    [event, merchantAlias, resourceType, resourceId, customerId, JSON.stringify(payload), signature]
  )
}

async function upsertWebhookCustomer(payload) {
  const { merchantAlias, resourceId, customerEmail, customerName, event } = payload
  const user = payload.snippexUserId
    ? await userRepository.findUserById(payload.snippexUserId)
    : customerEmail ? await userRepository.findUserByEmail(customerEmail) : null

  await pool.query(
    `
      INSERT INTO yampi_customers (
        merchant_alias, yampi_customer_id, email, name, user_id, last_event, raw_payload, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
      ON CONFLICT (merchant_alias, yampi_customer_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        user_id = COALESCE(EXCLUDED.user_id, yampi_customers.user_id),
        last_event = EXCLUDED.last_event,
        raw_payload = EXCLUDED.raw_payload,
        updated_at = NOW()
    `,
    [
      merchantAlias,
      resourceId,
      customerEmail,
      customerName,
      user?.id ?? null,
      event,
      JSON.stringify(payload),
    ]
  )

  return user?.id ?? null
}

async function upsertWebhookOrder(payload) {
  const { merchantAlias, resourceId, customerId, customerEmail, customerName, orderNumber, orderStatus } = payload
  const user = payload.snippexUserId
    ? await userRepository.findUserById(payload.snippexUserId)
    : customerEmail ? await userRepository.findUserByEmail(customerEmail) : null

  await pool.query(
    `
      INSERT INTO yampi_orders (
        merchant_alias, yampi_order_id, order_number, customer_id, customer_email, customer_name,
        user_id, order_status, raw_payload, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
      ON CONFLICT (merchant_alias, yampi_order_id)
      DO UPDATE SET
        order_number = EXCLUDED.order_number,
        customer_id = EXCLUDED.customer_id,
        customer_email = EXCLUDED.customer_email,
        customer_name = EXCLUDED.customer_name,
        user_id = COALESCE(EXCLUDED.user_id, yampi_orders.user_id),
        order_status = EXCLUDED.order_status,
        raw_payload = EXCLUDED.raw_payload,
        updated_at = NOW()
    `,
    [
      merchantAlias,
      resourceId,
      orderNumber,
      customerId,
      customerEmail,
      customerName,
      user?.id ?? null,
      orderStatus,
      JSON.stringify(payload),
    ]
  )

  return user?.id ?? null
}

async function linkCustomerToLocalUser(email) {
  if (!email) return null

  const user = await userRepository.findUserByEmail(email)
  if (!user) return null

  await pool.query(
    `
      UPDATE yampi_customers
      SET user_id = COALESCE(user_id, $2), updated_at = NOW()
      WHERE email = $1
    `,
    [email, user.id]
  )

  await pool.query(
    `
      UPDATE yampi_orders
      SET user_id = COALESCE(user_id, $2), updated_at = NOW()
      WHERE customer_email = $1
    `,
    [email, user.id]
  )

  return user.id
}

async function syncSubscriptionFromWebhook(payload) {
  return subscriptionRepository.syncSubscriptionFromYampiWebhook(payload)
}

module.exports = {
  recordWebhookEvent,
  upsertWebhookCustomer,
  upsertWebhookOrder,
  linkCustomerToLocalUser,
  syncSubscriptionFromWebhook,
}
