import test from 'node:test';
import assert from 'node:assert/strict';

import {
  subscriptionPlans,
  getPlanById,
  normalizePlanId,
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

test('normalizes selected plan ids for registration', () => {
  assert.equal(normalizePlanId('free'), 'free');
  assert.equal(normalizePlanId('pro'), 'pro');
  assert.equal(normalizePlanId('team'), 'team');
  assert.equal(normalizePlanId('unknown'), 'free');
  assert.equal(normalizePlanId(null), 'free');
});

test('keeps freemium as a non-checkout plan while paid plans retain checkout', () => {
  assert.equal(getPlanById('free').name, 'Freemium');
  assert.equal(getCheckoutUrl('free', 'monthly'), null);
  assert.equal(getCheckoutUrl('pro', 'monthly')?.startsWith('https://snippex-ia.pay.yampi.com.br'), true);
});

test('defines plan limits used by the product and pricing screens', () => {
  assert.deepEqual(getPlanById('free').limits, {
    totalSnippets: 10,
    aiExplanationSnippets: 5,
    teamMembers: null,
  });
  assert.deepEqual(getPlanById('pro').limits, {
    totalSnippets: 40,
    aiExplanationSnippets: 20,
    teamMembers: null,
  });
  assert.deepEqual(getPlanById('team').limits, {
    totalSnippets: 20,
    aiExplanationSnippets: 8,
    teamMembers: 6,
  });
});

test('keeps Yampi descriptions aligned with plan limits', () => {
  assert.match(getPlanById('free').yampiDescription, /10 snippets/);
  assert.match(getPlanById('free').yampiDescription, /5 snippets com explicação/);
  assert.match(getPlanById('pro').yampiDescription, /40 snippets/);
  assert.match(getPlanById('pro').yampiDescription, /20 snippets com explicação/);
  assert.match(getPlanById('team').yampiDescription, /6 membros/);
  assert.match(getPlanById('team').yampiDescription, /8 snippets com explicação/);
});
