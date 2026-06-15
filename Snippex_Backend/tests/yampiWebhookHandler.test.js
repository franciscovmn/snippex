const test = require('node:test')
const assert = require('node:assert/strict')

const { handleYampiWebhook } = require('../src/controllers/yampiController')
const { computeYampiWebhookSignature } = require('../src/integrations/yampi')

function createRepo() {
  return {
    calls: [],
    async recordWebhookEvent(payload) {
      this.calls.push(['recordWebhookEvent', payload.event])
    },
    async upsertWebhookCustomer(payload) {
      this.calls.push(['upsertWebhookCustomer', payload.customerEmail, payload.customerId])
    },
    async upsertWebhookOrder(payload) {
      this.calls.push(['upsertWebhookOrder', payload.orderNumber, payload.orderStatus])
    },
    async linkCustomerToLocalUser(email) {
      this.calls.push(['linkCustomerToLocalUser', email])
    },
  }
}

test('rejects a Yampi webhook with an invalid signature', async () => {
  const repo = createRepo()
  const result = await handleYampiWebhook({
    rawBody: JSON.stringify({ event: 'order.paid' }),
    signature: 'invalid',
    secret: 'secret',
    payload: { event: 'order.paid' },
    repo,
  })

  assert.equal(result.statusCode, 401)
  assert.equal(repo.calls.length, 0)
})

test('processes a paid order webhook and records customer and order data', async () => {
  const payload = {
    event: 'order.paid',
    merchant: { alias: 'lojaexemplo' },
    resource: {
      id: 1000001,
      number: 123456789012,
      customer_id: 987654,
      customer: { data: { id: 987654, email: 'cliente@exemplo.com', name: 'Cliente Exemplo' } },
      status: { data: { alias: 'paid', name: 'Pago' } },
    },
  }
  const rawBody = JSON.stringify(payload)
  const signature = computeYampiWebhookSignature(rawBody, 'secret')
  const repo = createRepo()

  const result = await handleYampiWebhook({
    rawBody,
    signature,
    secret: 'secret',
    payload,
    repo,
  })

  assert.equal(result.statusCode, 200)
  assert.deepEqual(repo.calls, [
    ['recordWebhookEvent', 'order.paid'],
    ['upsertWebhookCustomer', 'cliente@exemplo.com', '987654'],
    ['linkCustomerToLocalUser', 'cliente@exemplo.com'],
    ['upsertWebhookOrder', '123456789012', 'paid'],
  ])
})

test('processes a customer webhook and records only customer data', async () => {
  const payload = {
    event: 'customer.created',
    merchant: { alias: 'lojaexemplo' },
    resource: {
      id: 2222,
      email: 'cliente@exemplo.com',
      name: 'Cliente Exemplo',
    },
  }
  const rawBody = JSON.stringify(payload)
  const signature = computeYampiWebhookSignature(rawBody, 'secret')
  const repo = createRepo()

  const result = await handleYampiWebhook({
    rawBody,
    signature,
    secret: 'secret',
    payload,
    repo,
  })

  assert.equal(result.statusCode, 200)
  assert.deepEqual(repo.calls, [
    ['recordWebhookEvent', 'customer.created'],
    ['upsertWebhookCustomer', 'cliente@exemplo.com', '2222'],
    ['linkCustomerToLocalUser', 'cliente@exemplo.com'],
  ])
})
