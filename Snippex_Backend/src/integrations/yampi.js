const crypto = require('node:crypto')

const RELEVANT_EVENTS = new Set(['order.created', 'order.paid', 'order.status.updated', 'customer.created'])

function computeYampiWebhookSignature(rawBody, secret) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
}

function verifyYampiWebhookSignature(rawBody, secret, signature) {
  if (!rawBody || !secret || !signature) return false

  const expected = Buffer.from(computeYampiWebhookSignature(rawBody, secret))
  const received = Buffer.from(String(signature).trim())

  if (expected.length !== received.length) return false

  return crypto.timingSafeEqual(expected, received)
}

function isRelevantYampiEvent(event) {
  return RELEVANT_EVENTS.has(event)
}

function normalizeYampiWebhookPayload(payload) {
  const event = payload?.event ?? null
  const merchantAlias = payload?.merchant?.alias ?? null
  const resource = payload?.resource ?? {}
  const resourceType = event?.startsWith('customer.') ? 'customer' : 'order'
  const customerData = resource.customer?.data ?? {}
  const transactions = resource.transactions?.data ?? []
  const statusData = resource.status?.data ?? {}

  const customerId =
    resourceType === 'customer'
      ? String(resource.id ?? '')
      : String(customerData.id ?? resource.customer_id ?? '')

  return {
    event,
    merchantAlias,
    resourceType,
    resourceId: String(resource.id ?? ''),
    customerId: customerId || null,
    customerEmail: customerData.email ?? resource.email ?? null,
    customerName: customerData.name ?? resource.name ?? null,
    orderNumber: resource.number != null ? String(resource.number) : null,
    orderStatus: statusData.alias ?? transactions[0]?.status ?? null,
  }
}

module.exports = {
  computeYampiWebhookSignature,
  verifyYampiWebhookSignature,
  isRelevantYampiEvent,
  normalizeYampiWebhookPayload,
}
