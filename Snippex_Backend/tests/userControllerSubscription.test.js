const test = require('node:test')
const assert = require('node:assert/strict')

const controllerPath = require.resolve('../src/controllers/userController')
const userRepositoryPath = require.resolve('../src/repositories/userRepository')
const subscriptionRepositoryPath = require.resolve('../src/repositories/subscriptionRepository')

function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

function loadController({ userById, updatedSubscription } = {}) {
  delete require.cache[controllerPath]
  delete require.cache[userRepositoryPath]
  delete require.cache[subscriptionRepositoryPath]

  require.cache[userRepositoryPath] = {
    id: userRepositoryPath,
    filename: userRepositoryPath,
    loaded: true,
    exports: {
      findUserByEmail: async () => null,
      findUserById: async () => userById,
      createUser: async () => null,
      editProfile: async () => null,
      changePassword: async () => null,
    },
  }

  const updates = []

  require.cache[subscriptionRepositoryPath] = {
    id: subscriptionRepositoryPath,
    filename: subscriptionRepositoryPath,
    loaded: true,
    exports: {
      ensureUserSubscription: async () => null,
      updateSubscriptionForUser: async (userId, payload) => {
        updates.push({ userId, payload })
        return updatedSubscription ?? null
      },
    },
  }

  const controller = require('../src/controllers/userController')
  return { controller, updates }
}

test('returns the current user with subscription data', async () => {
  const { controller } = loadController({
    userById: {
      id: 'user-1',
      name: 'Francisco',
      user_name: 'francisco',
      email: 'francisco@example.com',
      subscription_plan_id: 'pro',
      subscription_billing_cycle: 'monthly',
      subscription_status: 'active',
      subscription_checkout_url: 'https://checkout.example/pro',
      subscription_cancel_at_period_end: false,
      subscription_current_period_end: new Date('2026-07-15T00:00:00Z'),
      subscription_activated_at: new Date('2026-06-15T00:00:00Z'),
      subscription_canceled_at: null,
    },
  })

  const res = createRes()
  await controller.getMe({ user: { id: 'user-1' } }, res)

  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body.user.subscription.plan_id, 'pro')
  assert.equal(res.body.user.subscription.billing_cycle, 'monthly')
  assert.equal(res.body.user.subscription.status, 'active')
})

test('marks subscription renewal as canceled without ending access immediately', async () => {
  const { controller, updates } = loadController({
    userById: {
      id: 'user-1',
      name: 'Francisco',
      user_name: 'francisco',
      email: 'francisco@example.com',
      subscription_plan_id: 'team',
      subscription_billing_cycle: 'yearly',
      subscription_status: 'active',
      subscription_checkout_url: 'https://checkout.example/team',
      subscription_cancel_at_period_end: true,
      subscription_current_period_end: new Date('2027-06-15T00:00:00Z'),
      subscription_activated_at: new Date('2026-06-15T00:00:00Z'),
      subscription_canceled_at: null,
    },
    updatedSubscription: {
      user_id: 'user-1',
      cancel_at_period_end: true,
    },
  })

  const res = createRes()
  await controller.cancelSubscriptionRenewal({ user: { id: 'user-1' } }, res)

  assert.equal(res.statusCode, 200)
  assert.equal(updates.length, 1)
  assert.deepEqual(updates[0], {
    userId: 'user-1',
    payload: {
      cancel_at_period_end: true,
      status: 'active',
    },
  })
  assert.equal(res.body.user.subscription.cancel_at_period_end, true)
})
