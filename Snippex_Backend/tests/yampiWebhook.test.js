const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')

const {
  computeYampiWebhookSignature,
  verifyYampiWebhookSignature,
  normalizeYampiWebhookPayload,
  isRelevantYampiEvent,
} = require('../src/integrations/yampi')

test('computes the Yampi webhook signature using HMAC SHA256 base64', () => {
  const body = JSON.stringify({
    event: 'order.created',
    time: '2020-06-20 00:00:00',
    resource: {
      id: 1121333,
    },
  })

  const expected = crypto.createHmac('sha256', 'wh_FBmkbmkMSAKmkMBKmdsbUUHjnlmlm').update(body).digest('base64')
  const signature = computeYampiWebhookSignature(body, 'wh_FBmkbmkMSAKmkMBKmdsbUUHjnlmlm')

  assert.equal(signature, expected)
  assert.equal(verifyYampiWebhookSignature(body, 'wh_FBmkbmkMSAKmkMBKmdsbUUHjnlmlm', signature), true)
})

test('normalizes order and customer webhook payloads', () => {
  const orderPayload = {
    event: 'order.paid',
    merchant: { alias: 'lojaexemplo' },
    resource: {
      id: 1000001,
      number: 123456789012,
      customer_id: 987654,
      customer: {
        data: {
          id: 987654,
          email: 'cliente@exemplo.com',
          name: 'Cliente Exemplo',
        },
      },
      status: {
        data: {
          id: 4,
          alias: 'paid',
          name: 'Pago',
        },
      },
      transactions: {
        data: [
          {
            status: 'paid',
          },
        ],
      },
    },
  }

  const customerPayload = {
    event: 'customer.created',
    merchant: { alias: 'lojaexemplo' },
    resource: {
      id: 2222,
      email: 'cliente@exemplo.com',
      name: 'Cliente Exemplo',
    },
  }

  assert.equal(isRelevantYampiEvent('order.paid'), true)
  assert.equal(isRelevantYampiEvent('customer.created'), true)
  assert.equal(isRelevantYampiEvent('product.updated'), false)

  assert.deepEqual(normalizeYampiWebhookPayload(orderPayload), {
    event: 'order.paid',
    merchantAlias: 'lojaexemplo',
    resourceType: 'order',
    resourceId: '1000001',
    customerId: '987654',
    customerEmail: 'cliente@exemplo.com',
    customerName: 'Cliente Exemplo',
    orderNumber: '123456789012',
    orderStatus: 'paid',
  })

  assert.deepEqual(normalizeYampiWebhookPayload(customerPayload), {
    event: 'customer.created',
    merchantAlias: 'lojaexemplo',
    resourceType: 'customer',
    resourceId: '2222',
    customerId: '2222',
    customerEmail: 'cliente@exemplo.com',
    customerName: 'Cliente Exemplo',
    orderNumber: null,
    orderStatus: null,
  })
})
