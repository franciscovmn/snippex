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
    purchaseText: '',
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
    purchaseText: 'Cliente Exemplo',
  })
})

test('normalizes plan and billing cycle from Yampi item SKU', () => {
  const createPayload = (sku) => ({
    event: 'order.paid',
    merchant: { alias: 'snippex-ia' },
    resource: {
      id: 165211245,
      number: 1500437616410530,
      customer: {
        data: {
          id: 259885618,
          email: 'cliente@exemplo.com',
          name: 'Cliente Exemplo',
        },
      },
      status: {
        data: {
          alias: 'paid',
        },
      },
      items: {
        data: [
          {
            sku: {
              data: {
                sku,
              },
            },
          },
        ],
      },
    },
  })

  assert.deepEqual(normalizeYampiWebhookPayload(createPayload('SWYVNVE8G')), {
    event: 'order.paid',
    merchantAlias: 'snippex-ia',
    resourceType: 'order',
    resourceId: '165211245',
    customerId: '259885618',
    customerEmail: 'cliente@exemplo.com',
    customerName: 'Cliente Exemplo',
    orderNumber: '1500437616410530',
    orderStatus: 'paid',
    purchaseText: 'SWYVNVE8G',
    planId: 'pro',
    billingCycle: 'monthly',
  })

  assert.equal(normalizeYampiWebhookPayload(createPayload('96TRA8KYC')).planId, 'pro')
  assert.equal(normalizeYampiWebhookPayload(createPayload('96TRA8KYC')).billingCycle, 'yearly')
  assert.equal(normalizeYampiWebhookPayload(createPayload('9RBC46XL5')).planId, 'team')
  assert.equal(normalizeYampiWebhookPayload(createPayload('9RBC46XL5')).billingCycle, 'monthly')
  assert.equal(normalizeYampiWebhookPayload(createPayload('RBJB2EJ4C')).planId, 'team')
  assert.equal(normalizeYampiWebhookPayload(createPayload('RBJB2EJ4C')).billingCycle, 'yearly')
})

test('normalizes Snippex checkout metadata from Yampi payload', () => {
  const payload = {
    event: 'order.paid',
    merchant: { alias: 'snippex-ia' },
    resource: {
      id: 165211245,
      number: 1500437616410530,
      customer: { data: { id: 259885618, email: 'checkout@exemplo.com' } },
      status: { data: { alias: 'paid' } },
      metadata: {
        data: [
          { key: 'source_platform', value: 'snippex' },
          { key: 'snippex_user_id', value: '194f6d66-eba9-4a2c-8211-025048a21ae4' },
          { key: 'snippex_plan_id', value: 'pro' },
          { key: 'snippex_billing_cycle', value: 'monthly' },
        ],
      },
      items: {
        data: [
          { sku: { data: { sku: 'SWYVNVE8G' } } },
        ],
      },
    },
  }

  const normalized = normalizeYampiWebhookPayload(payload)

  assert.equal(normalized.snippexUserId, '194f6d66-eba9-4a2c-8211-025048a21ae4')
  assert.equal(normalized.snippexPlanId, 'pro')
  assert.equal(normalized.snippexBillingCycle, 'monthly')
  assert.equal(normalized.planId, 'pro')
  assert.equal(normalized.billingCycle, 'monthly')
})
