const PLAN_LIMITS = {
  free: {
    planId: 'free',
    totalSnippets: 10,
    aiExplanationSnippets: 5,
    teamMembers: null,
  },
  pro: {
    planId: 'pro',
    totalSnippets: 40,
    aiExplanationSnippets: 20,
    teamMembers: null,
  },
  team: {
    planId: 'team',
    totalSnippets: 20,
    aiExplanationSnippets: 8,
    teamMembers: 6,
  },
}

function normalizePlanId(planId) {
  return Object.prototype.hasOwnProperty.call(PLAN_LIMITS, planId) ? planId : 'free'
}

function getEffectivePlanId(subscription) {
  if (!subscription || subscription.status !== 'active') return 'free'

  return normalizePlanId(subscription.plan_id)
}

function getPlanLimits(planId) {
  return PLAN_LIMITS[normalizePlanId(planId)]
}

function shouldAllowSnippetCreation({ usage, limits }) {
  return Number(usage?.totalSnippets ?? 0) < limits.totalSnippets
}

function shouldTriggerAiExplanation({ usage, limits }) {
  return Number(usage?.aiExplanationSnippets ?? 0) < limits.aiExplanationSnippets
}

module.exports = {
  PLAN_LIMITS,
  normalizePlanId,
  getEffectivePlanId,
  getPlanLimits,
  shouldAllowSnippetCreation,
  shouldTriggerAiExplanation,
}
