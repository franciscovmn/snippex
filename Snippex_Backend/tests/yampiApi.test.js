const test = require('node:test')
const assert = require('node:assert/strict')

const {
  buildYampiApiHeaders,
  buildWebhookRequestBody,
  pickMerchantAlias,
  findMatchingWebhook,
} = require('../src/integrations/yampiApi')

test('builds Yampi API headers with user token and secret key', () => {
  assert.deepEqual(
    buildYampiApiHeaders('token-123', 'secret-456'),
    {
      'Content-Type': 'application/json',
      'User-Token': 'token-123',
      'User-Secret-Key': 'secret-456',
    }
  )
})

test('builds the webhook request body used to register Yampi webhooks', () => {
  assert.deepEqual(buildWebhookRequestBody({
    url: 'https://snippex.example/api/integrations/yampi/webhook',
    name: 'Snippex Yampi',
    events: ['order.created', 'order.paid', 'customer.created'],
  }), {
    url: 'https://snippex.example/api/integrations/yampi/webhook',
    name: 'Snippex Yampi',
    events: ['order.created', 'order.paid', 'customer.created'],
  })
})

test('picks the owner merchant alias from auth/me response and falls back to the first merchant', () => {
  const authMe = {
    data: {
      merchants: {
        data: [
          { alias: 'secondary-store', profile: 'store_v2', is_marketplace: false },
          { alias: 'owner-store', profile: 'store_v2', is_marketplace: false, owner_id: 10 },
        ],
      },
    },
  }

  assert.equal(pickMerchantAlias(authMe), 'secondary-store')
  assert.equal(pickMerchantAlias({ data: { merchants: { data: [{ alias: 'fallback-store' }] } } }), 'fallback-store')
})

test('finds an existing webhook by exact URL or name', () => {
  const webhooks = {
    data: [
      { id: 1, name: 'Outro webhook', url: 'https://example.com/other' },
      { id: 2, name: 'Snippex Yampi', url: 'https://example.com/webhook' },
    ],
  }

  assert.equal(findMatchingWebhook(webhooks, 'https://example.com/webhook', 'Snippex Yampi')?.id, 2)
  assert.equal(findMatchingWebhook(webhooks, 'https://example.com/missing', 'Snippex Yampi')?.id, 2)
  assert.equal(findMatchingWebhook(webhooks, 'https://example.com/missing', 'Missing'), null)
})
