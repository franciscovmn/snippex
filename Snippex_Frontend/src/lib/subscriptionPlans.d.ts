export type BillingCycle = 'monthly' | 'yearly';
export type PlanId = 'free' | 'pro' | 'team';

export interface PaidSubscriptionPlan {
  id: 'pro' | 'team';
  billingCycle: BillingCycle;
  checkoutUrl: string;
}

export interface PlanCatalogEntry {
  id: PlanId;
  name: string;
  eyebrow: string;
  description: string;
  yampiDescription: string;
  limits: {
    totalSnippets: number;
    aiExplanationSnippets: number;
    teamMembers: number | null;
  };
  highlights: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export const subscriptionPlans: PaidSubscriptionPlan[];
export const planCatalog: PlanCatalogEntry[];
export function normalizePlanId(planId: unknown): PlanId;
export function getPlanById(planId: unknown): PlanCatalogEntry;
export function getCheckoutUrl(planId: PlanId, billingCycle: BillingCycle): string | null;
