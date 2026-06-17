const crypto = require('node:crypto')

const RELEVANT_EVENTS = new Set(['order.created', 'order.paid', 'order.status.updated', 'customer.created'])
const DEFAULT_PLAN_SKU_MAP = {
  SWYVNVE8G: { planId: 'pro', billingCycle: 'monthly' },
  '96TRA8KYC': { planId: 'pro', billingCycle: 'yearly' },
  '9RBC46XL5': { planId: 'team', billingCycle: 'monthly' },
  RBJB2EJ4C: { planId: 'team', billingCycle: 'yearly' },
}

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

function parsePlanSkuMap(rawValue) {
  const envMap = String(rawValue ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [sku, planId, billingCycle] = entry.split(':').map((part) => part?.trim())

      if (sku && ['pro', 'team'].includes(planId) && ['monthly', 'yearly'].includes(billingCycle)) {
        acc[sku] = { planId, billingCycle }
      }

      return acc
    }, {})

  return {
    ...DEFAULT_PLAN_SKU_MAP,
    ...envMap,
  }
}

function getItemSku(item) {
  return [
    item?.sku?.data?.sku,
    item?.sku?.sku,
    item?.sku,
    item?.sku_code,
    item?.product?.data?.sku,
    item?.product?.sku,
    item?.variant?.data?.sku,
    item?.variant?.sku,
  ].find((value) => typeof value === 'string' && value.trim())
}

function normalizeMetadata(metadata) {
  const items = Array.isArray(metadata?.data) ? metadata.data : []

  return items.reduce((acc, item) => {
    if (item?.key) acc[item.key] = item.value ?? ''
    return acc
  }, {})
}

function normalizeYampiWebhookPayload(payload) {
  const event = payload?.event ?? null
  const merchantAlias = payload?.merchant?.alias ?? null
  const resource = payload?.resource ?? {}
  const resourceType = event?.startsWith('customer.') ? 'customer' : 'order'
  const customerData = resource.customer?.data ?? {}
  const transactions = resource.transactions?.data ?? []
  const statusData = resource.status?.data ?? {}
  const itemCollections = [
    resource.items?.data ?? [],
    resource.products?.data ?? [],
  ].filter((items) => Array.isArray(items))
  const itemTexts = itemCollections.flatMap((items) =>
    items.map((item) => [
      item?.name,
      item?.title,
      item?.product?.name,
      item?.product?.data?.name,
      item?.product_name,
      item?.variant?.name,
      item?.variant_name,
      getItemSku(item),
    ].filter(Boolean).join(' '))
  )
  const itemSkus = itemCollections
    .flatMap((items) => items.map(getItemSku))
    .filter(Boolean)
  const planSkuMap = parsePlanSkuMap(process.env.YAMPI_PLAN_SKU_MAP)
  const planMatch = itemSkus.map((sku) => planSkuMap[sku]).find(Boolean)
  const purchaseText = [
    resource.name,
    resource.title,
    resource.reference,
    ...itemTexts,
  ].filter(Boolean).join(' ')

  const customerId =
    resourceType === 'customer'
      ? String(resource.id ?? '')
      : String(customerData.id ?? resource.customer_id ?? '')
  const metadata = normalizeMetadata(resource.metadata)

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
    purchaseText,
    ...(metadata.snippex_user_id ? { snippexUserId: metadata.snippex_user_id } : {}),
    ...(metadata.snippex_plan_id ? { snippexPlanId: metadata.snippex_plan_id } : {}),
    ...(metadata.snippex_billing_cycle ? { snippexBillingCycle: metadata.snippex_billing_cycle } : {}),
    ...(planMatch ? planMatch : {}),
  }
}

module.exports = {
  computeYampiWebhookSignature,
  verifyYampiWebhookSignature,
  isRelevantYampiEvent,
  normalizeYampiWebhookPayload,
  parsePlanSkuMap,
}
