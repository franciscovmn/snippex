import test from 'node:test';
import assert from 'node:assert/strict';

import {
  subscriptionPlans,
  getCheckoutUrl,
} from '../src/lib/subscriptionPlans.js';

test('defines the paid subscription plans with checkout urls', () => {
  assert.deepEqual(
    subscriptionPlans.map((plan) => ({ id: plan.id, billingCycle: plan.billingCycle, checkoutUrl: plan.checkoutUrl })),
    [
      {
        id: 'pro',
        billingCycle: 'monthly',
        checkoutUrl: 'https://snippex-ia.pay.yampi.com.br/r/7FX3TUDOCK',
      },
      {
        id: 'pro',
        billingCycle: 'yearly',
        checkoutUrl: 'https://snippex-ia.pay.yampi.com.br/r/8NJ0LBGLCX',
      },
      {
        id: 'team',
        billingCycle: 'monthly',
        checkoutUrl: 'https://snippex-ia.pay.yampi.com.br/r/1HUSKUIK5H',
      },
      {
        id: 'team',
        billingCycle: 'yearly',
        checkoutUrl: 'https://snippex-ia.pay.yampi.com.br/r/I0K935D98K',
      },
    ]
  );
});

test('returns the checkout url for a plan and billing cycle', () => {
  assert.equal(getCheckoutUrl('pro', 'monthly'), 'https://snippex-ia.pay.yampi.com.br/r/7FX3TUDOCK');
  assert.equal(getCheckoutUrl('team', 'yearly'), 'https://snippex-ia.pay.yampi.com.br/r/I0K935D98K');
});
