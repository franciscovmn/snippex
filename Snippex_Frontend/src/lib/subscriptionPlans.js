export const subscriptionPlans = [
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
];

export const planCatalog = [
  {
    id: 'free',
    name: 'Freemium',
    eyebrow: 'Gratuito',
    description: 'Para começar a organizar pequenos trechos de código sem pagamento.',
    yampiDescription:
      'Plano gratuito para começar no Snippex. Inclui até 10 snippets no total, públicos ou privados, sendo até 5 snippets com explicação gerada por IA. Ideal para experimentar a plataforma, organizar pequenos trechos de código e explorar a comunidade.',
    limits: {
      totalSnippets: 10,
      aiExplanationSnippets: 5,
      teamMembers: null,
    },
    highlights: [
      'Até 10 snippets públicos ou privados',
      'Até 5 snippets com explicação da IA',
      'Explorar e salvar conteúdos da comunidade',
    ],
    ctaLabel: 'Criar conta grátis',
    ctaHref: '/register',
  },
  {
    id: 'pro',
    name: 'Pro',
    eyebrow: 'Individual',
    description: 'Para usar o Snippex como biblioteca pessoal de código.',
    yampiDescription:
      'Plano individual para quem usa o Snippex como biblioteca pessoal de código. Inclui até 40 snippets no total, públicos ou privados, sendo até 20 snippets com explicação gerada por IA. Ideal para desenvolvedores que querem organizar, documentar e reutilizar trechos de código com apoio de IA.',
    limits: {
      totalSnippets: 40,
      aiExplanationSnippets: 20,
      teamMembers: null,
    },
    highlights: [
      'Até 40 snippets públicos ou privados',
      'Até 20 snippets com explicação da IA',
      'Biblioteca pessoal para uso frequente',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    eyebrow: 'Equipe',
    description: 'Para equipes com workspace compartilhado e owner pagante.',
    yampiDescription:
      'Plano para equipes que querem compartilhar conhecimento técnico em um workspace colaborativo. Inclui até 6 membros no workspace. Cada membro pode criar até 20 snippets no total, públicos ou privados, sendo até 8 snippets com explicação gerada por IA. O plano é pago por um owner, e os membros convidados acessam o workspace sem pagamento individual.',
    limits: {
      totalSnippets: 20,
      aiExplanationSnippets: 8,
      teamMembers: 6,
    },
    highlights: [
      'Até 6 membros no workspace',
      '20 snippets por membro',
      '8 explicações de IA por membro',
    ],
  },
];

export function normalizePlanId(planId) {
  return planCatalog.some((plan) => plan.id === planId) ? planId : 'free';
}

export function getPlanById(planId) {
  const normalizedPlanId = normalizePlanId(planId);
  return planCatalog.find((plan) => plan.id === normalizedPlanId) ?? planCatalog[0];
}

export function getCheckoutUrl(planId, billingCycle) {
  if (planId === 'free') return null;

  return subscriptionPlans.find(
    (plan) => plan.id === planId && plan.billingCycle === billingCycle
  )?.checkoutUrl ?? null;
}
