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

function loadController({ userByEmail, userById, createdUser, updatedSubscription, checkoutSubscription } = {}) {
  delete require.cache[controllerPath]
  delete require.cache[userRepositoryPath]
  delete require.cache[subscriptionRepositoryPath]

  require.cache[userRepositoryPath] = {
    id: userRepositoryPath,
    filename: userRepositoryPath,
    loaded: true,
    exports: {
      findUserByEmail: async () => userByEmail ?? null,
      findUserById: async () => userById,
      createUser: async () => createdUser ?? null,
      editProfile: async () => null,
      changePassword: async () => null,
    },
  }

  const updates = []
  const checkoutIntents = []

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
      upsertCheckoutIntent: async (payload) => {
        checkoutIntents.push(payload)
        return checkoutSubscription ?? payload
      },
    },
  }

  const controller = require('../src/controllers/userController')
  return { controller, updates, checkoutIntents }
}

test('creates a local session from a valid Supabase Google user', async () => {
  const originalFetch = global.fetch
  const originalSupabaseUrl = process.env.SUPABASE_URL
  const originalSupabaseAnonKey = process.env.SUPABASE_ANON_KEY
  const originalJwtSecret = process.env.JWT_SECRET

  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_ANON_KEY = 'anon-key'
  process.env.JWT_SECRET = 'test-secret'

  global.fetch = async (url, options) => {
    assert.equal(url, 'https://example.supabase.co/auth/v1/user')
    assert.equal(options.headers.Authorization, 'Bearer supabase-token')
    assert.equal(options.headers.apikey, 'anon-key')

    return {
      ok: true,
      json: async () => ({
        id: 'supabase-user-1',
        email: 'google.user@example.com',
        user_metadata: {
          full_name: 'Google User',
          name: 'Google User',
        },
      }),
    }
  }

  try {
    const localUser = {
      id: 'local-user-1',
      name: 'Google User',
      user_name: 'google-user',
      email: 'google.user@example.com',
    }

    const { controller } = loadController({
      createdUser: localUser,
      userById: localUser,
    })

    const res = createRes()
    await controller.supabaseLogin({ body: { access_token: 'supabase-token' } }, res)

    assert.equal(res.statusCode, null)
    assert.equal(res.body.user.email, 'google.user@example.com')
    assert.equal(typeof res.body.token, 'string')
  } finally {
    global.fetch = originalFetch
    process.env.SUPABASE_URL = originalSupabaseUrl
    process.env.SUPABASE_ANON_KEY = originalSupabaseAnonKey
    process.env.JWT_SECRET = originalJwtSecret
  }
})

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

test('registers checkout intent before redirecting to Yampi', async () => {
  const expectedCheckoutUrl = 'https://snippex-ia.pay.yampi.com.br/cart/items?product_option_id%5B%5D=300330119&quantity%5B%5D=1&tokenReference=7FX3TUDOCK&metadata%5Bsource_platform%5D=snippex&metadata%5Bsnippex_user_id%5D=user-1&metadata%5Bsnippex_plan_id%5D=pro&metadata%5Bsnippex_billing_cycle%5D=monthly&redirectTo=checkout&skipToCheckout=1&store_token=XTTrCEosIxdWmG0qK7zFCsJj4yOOeibRh1IWeCkU&clearCart=1'
  const { controller, checkoutIntents } = loadController({
    checkoutSubscription: {
      user_id: 'user-1',
      plan_id: 'pro',
      billing_cycle: 'monthly',
      status: 'pending_payment',
      checkout_url: expectedCheckoutUrl,
    },
  })

  const res = createRes()
  await controller.createCheckoutIntent({
    user: { id: 'user-1' },
    body: { planId: 'pro', billingCycle: 'monthly' },
  }, res)

  assert.equal(res.statusCode, 200)
  assert.deepEqual(checkoutIntents, [
    {
      userId: 'user-1',
      planId: 'pro',
      billingCycle: 'monthly',
      checkoutUrl: expectedCheckoutUrl,
    },
  ])
  assert.equal(res.body.checkoutUrl, expectedCheckoutUrl)
  assert.equal(res.body.subscription.status, 'pending_payment')
})
