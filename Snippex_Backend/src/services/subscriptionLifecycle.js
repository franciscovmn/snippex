const ACTIVE_ORDER_STATUSES = new Set(['paid', 'approved', 'completed', 'paid_confirmed'])
const PENDING_ORDER_STATUSES = new Set(['pending', 'waiting', 'processing', 'analysis'])
const INACTIVE_ORDER_STATUSES = new Set(['canceled', 'cancelled', 'refunded', 'chargeback', 'expired'])

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function deriveSubscriptionPlanFromText(text) {
  const normalized = normalizeText(text)

  let planId = null
  if (/(team|equipe)/.test(normalized)) {
    planId = 'team'
  } else if (/(pro|individual)/.test(normalized)) {
    planId = 'pro'
  }

  let billingCycle = null
  if (/(anual|annual|yearly)/.test(normalized)) {
    billingCycle = 'yearly'
  } else if (/(mensal|monthly)/.test(normalized)) {
    billingCycle = 'monthly'
  }

  return { planId, billingCycle }
}

function resolveSubscriptionStatusFromYampi({ event, orderStatus }) {
  const normalizedStatus = normalizeText(orderStatus)

  if (ACTIVE_ORDER_STATUSES.has(normalizedStatus) || event === 'order.paid') {
    return 'active'
  }

  if (INACTIVE_ORDER_STATUSES.has(normalizedStatus)) {
    return 'inactive'
  }

  if (PENDING_ORDER_STATUSES.has(normalizedStatus) || event === 'order.created') {
    return 'pending_payment'
  }

  return null
}

function computeCurrentPeriodEnd(billingCycle, referenceDate = new Date()) {
  const periodEnd = new Date(referenceDate.getTime())

  if (billingCycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    return periodEnd
  }

  periodEnd.setMonth(periodEnd.getMonth() + 1)
  return periodEnd
}

module.exports = {
  deriveSubscriptionPlanFromText,
  resolveSubscriptionStatusFromYampi,
  computeCurrentPeriodEnd,
}
