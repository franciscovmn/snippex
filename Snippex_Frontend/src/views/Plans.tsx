import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { SnippexLogo } from '../components/SnippexLogo';
import { planCatalog, getCheckoutUrl } from '../lib/subscriptionPlans.js';
import '../css/plans.css';

type BillingCycle = 'monthly' | 'yearly';

const billingCycleCopy: Record<BillingCycle, { label: string; note: string }> = {
  monthly: {
    label: 'Mensal',
    note: 'Renovação automática mensal com cancelamento disponível.',
  },
  yearly: {
    label: 'Anual',
    note: 'Renovação automática anual com desconto no ciclo longo.',
  },
};

export default function Plans() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const handleCheckout = (planId: 'pro' | 'team') => {
    const url = getCheckoutUrl(planId, billingCycle);
    if (!url) return;
    window.location.assign(url);
  };

  return (
    <main className="plans-page">
      <header className="plans-topbar">
        <Link to="/login" className="plans-brand">
          <SnippexLogo />
        </Link>

        <div className="plans-topbar-actions">
          <Link to="/login" className="plans-topbar-link">Entrar</Link>
        </div>
      </header>

      <section className="plans-hero">
        <div className="plans-hero-copy">
          <Badge className="plans-eyebrow">
            <Sparkles size={12} />
            Planos
          </Badge>
          <h1>Escolha o plano que acompanha o seu ritmo.</h1>
          <p>
            Comece no Freemium e faça upgrade para Pro ou Team quando quiser.
            Mensal e anual usam os mesmos recursos, com preço e ciclo diferentes.
          </p>
        </div>

        <div className="plans-hero-aside">
          <div className="billing-toggle" role="tablist" aria-label="Ciclo de cobrança">
            <button
              type="button"
              className={`billing-toggle__button ${billingCycle === 'monthly' ? 'is-active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Mensal
            </button>
            <button
              type="button"
              className={`billing-toggle__button ${billingCycle === 'yearly' ? 'is-active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Anual
            </button>
          </div>
          <p className="plans-cycle-note">{billingCycleCopy[billingCycle].note}</p>
        </div>
      </section>

      <section className="plans-grid">
        {planCatalog.map((plan) => {
          if (plan.id === 'free') {
            return (
              <Card key={plan.id} className="plan-card plan-card--free">
                <div className="plan-card__head">
                  <div>
                    <p className="plan-card__eyebrow">{plan.eyebrow}</p>
                    <h2>{plan.name}</h2>
                  </div>
                  <Badge>Grátis</Badge>
                </div>
                <p className="plan-card__description">{plan.description}</p>
                <ul className="plan-card__list">
                  {plan.highlights.map((item: string) => (
                    <li key={item}>
                      <Check size={14} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ArrowRight size={16} />}
                  onClick={() => window.location.assign(plan.ctaHref ?? '/register')}
                >
                  {plan.ctaLabel}
                </Button>
              </Card>
            );
          }

          const checkoutUrl = getCheckoutUrl(plan.id, billingCycle);

          return (
            <Card key={plan.id} className={`plan-card plan-card--paid plan-card--${plan.id}`}>
              <div className="plan-card__head">
                <div>
                  <p className="plan-card__eyebrow">{plan.eyebrow}</p>
                  <h2>{plan.name}</h2>
                </div>
                <Badge color={plan.id === 'pro' ? '#3b82f6' : '#a855f7'}>
                  {billingCycleCopy[billingCycle].label}
                </Badge>
              </div>
              <p className="plan-card__description">{plan.description}</p>
              <ul className="plan-card__list">
                {plan.highlights.map((item: string) => (
                  <li key={item}>
                    <Check size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="plan-card__footer">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<CreditCard size={16} />}
                  onClick={() => handleCheckout(plan.id as 'pro' | 'team')}
                  disabled={!checkoutUrl}
                >
                  {checkoutUrl ? `Assinar ${plan.name}` : 'Checkout indisponível'}
                </Button>
                <span className="plan-card__footer-note">
                  Você pode cancelar a renovação sem perder o período já pago.
                </span>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="plans-footer">
        <div className="plans-footer__note">
          <ShieldCheck size={16} />
          <span>O acesso é liberado após confirmação do pagamento pela Yampi.</span>
        </div>
      </section>
    </main>
  );
}
