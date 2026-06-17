const test = require('node:test')
const assert = require('node:assert/strict')

const {
  getEffectivePlanId,
  getPlanLimits,
  shouldAllowSnippetCreation,
  shouldTriggerAiExplanation,
} = require('../src/services/planLimits')

test('returns snippet and AI limits for each plan', () => {
  assert.deepEqual(getPlanLimits('free'), {
    planId: 'free',
    totalSnippets: 10,
    aiExplanationSnippets: 5,
    teamMembers: null,
  })

  assert.deepEqual(getPlanLimits('pro'), {
    planId: 'pro',
    totalSnippets: 40,
    aiExplanationSnippets: 20,
    teamMembers: null,
  })

  assert.deepEqual(getPlanLimits('team'), {
    planId: 'team',
    totalSnippets: 20,
    aiExplanationSnippets: 8,
    teamMembers: 6,
  })
})

test('falls back to freemium limits for unknown plans', () => {
  assert.equal(getPlanLimits('unknown').planId, 'free')
  assert.equal(getPlanLimits(null).totalSnippets, 10)
})

test('uses paid plan limits only for active subscriptions', () => {
  assert.equal(getEffectivePlanId({ plan_id: 'pro', status: 'active' }), 'pro')
  assert.equal(getEffectivePlanId({ plan_id: 'team', status: 'active' }), 'team')
  assert.equal(getEffectivePlanId({ plan_id: 'pro', status: 'pending_payment' }), 'free')
  assert.equal(getEffectivePlanId({ plan_id: 'team', status: 'inactive' }), 'free')
  assert.equal(getEffectivePlanId(null), 'free')
})

test('allows snippet creation until the total plan limit is reached', () => {
  const freeLimits = getPlanLimits('free')

  assert.equal(shouldAllowSnippetCreation({ usage: { totalSnippets: 9 }, limits: freeLimits }), true)
  assert.equal(shouldAllowSnippetCreation({ usage: { totalSnippets: 10 }, limits: freeLimits }), false)
})

test('triggers AI explanation only while the AI quota is available', () => {
  const proLimits = getPlanLimits('pro')

  assert.equal(shouldTriggerAiExplanation({ usage: { aiExplanationSnippets: 19 }, limits: proLimits }), true)
  assert.equal(shouldTriggerAiExplanation({ usage: { aiExplanationSnippets: 20 }, limits: proLimits }), false)
})
