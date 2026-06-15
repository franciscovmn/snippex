export type BillingCycle = 'monthly' | 'yearly';

export interface PaidSubscriptionPlan {
  id: 'pro' | 'team';
  billingCycle: BillingCycle;
  checkoutUrl: string;
}

export interface PlanCatalogEntry {
  id: 'free' | 'pro' | 'team';
  name: string;
  eyebrow: string;
  description: string;
  highlights: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export const subscriptionPlans: PaidSubscriptionPlan[];
export const planCatalog: PlanCatalogEntry[];
export function getCheckoutUrl(planId: 'pro' | 'team', billingCycle: BillingCycle): string | null;
