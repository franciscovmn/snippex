const test = require('node:test')
const assert = require('node:assert/strict')

const {
  deriveSubscriptionPlanFromText,
  resolveSubscriptionStatusFromYampi,
  computeCurrentPeriodEnd,
} = require('../src/services/subscriptionLifecycle')

test('derives plan and billing cycle from subscription text', () => {
  assert.deepEqual(
    deriveSubscriptionPlanFromText('Snippex Team - Anual'),
    { planId: 'team', billingCycle: 'yearly' }
  )

  assert.deepEqual(
    deriveSubscriptionPlanFromText('Snippex Pro - Mensal'),
    { planId: 'pro', billingCycle: 'monthly' }
  )
})

test('resolves subscription status from yampi event and order status', () => {
  assert.equal(resolveSubscriptionStatusFromYampi({ event: 'order.created', orderStatus: null }), 'pending_payment')
  assert.equal(resolveSubscriptionStatusFromYampi({ event: 'order.paid', orderStatus: 'paid' }), 'active')
  assert.equal(resolveSubscriptionStatusFromYampi({ event: 'order.status.updated', orderStatus: 'cancelled' }), 'inactive')
})

test('computes the current period end from the billing cycle', () => {
  const monthly = computeCurrentPeriodEnd('monthly', new Date('2026-06-15T12:00:00Z'))
  const yearly = computeCurrentPeriodEnd('yearly', new Date('2026-06-15T12:00:00Z'))

  assert.equal(monthly.toISOString().startsWith('2026-07-15'), true)
  assert.equal(yearly.toISOString().startsWith('2027-06-15'), true)
})
