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
    description: 'Acesso inicial para conhecer o Snippex e publicar snippets básicos.',
    highlights: ['Explorar a comunidade', 'Salvar snippets', 'Criar conta sem pagamento'],
    ctaLabel: 'Criar conta grátis',
    ctaHref: '/register',
  },
  {
    id: 'pro',
    name: 'Pro',
    eyebrow: 'Individual',
    description: 'Para uso pessoal com foco em organização, pesquisa e produtividade.',
    highlights: ['Acesso completo ao Snippex', 'Fluxo de conteúdo mais rápido', 'Renovação automática com cancelamento disponível'],
  },
  {
    id: 'team',
    name: 'Team',
    eyebrow: 'Equipe',
    description: 'Para times que precisam compartilhar conhecimento e manter padrão.',
    highlights: ['Tudo do Pro', 'Uso em equipe', 'Acesso unificado para o grupo'],
  },
];

export function getCheckoutUrl(planId, billingCycle) {
  return subscriptionPlans.find(
    (plan) => plan.id === planId && plan.billingCycle === billingCycle
  )?.checkoutUrl ?? null;
}
