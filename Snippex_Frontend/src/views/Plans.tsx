import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import axios from 'axios';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { planCatalog, getCheckoutUrl } from '../lib/subscriptionPlans.js';
import type { PlanId } from '../lib/subscriptionPlans';
import { userService } from '../services/userService';
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
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }
  const currentPlanId = (
    user?.subscription?.status === 'active' ? user?.subscription?.plan_id : 'free'
  ) as PlanId;
  const isLogged = Boolean(user);

  const handleCheckout = async (planId: 'pro' | 'team') => {
    const fallbackUrl = getCheckoutUrl(planId, billingCycle);

    try {
      const response = await userService.createCheckoutIntent(planId, billingCycle);
      const url = response.checkoutUrl ?? fallbackUrl;
      if (!url) return;
      window.location.assign(url);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 404 && fallbackUrl) {
        window.location.assign(fallbackUrl);
        return;
      }
      alert('Não foi possível preparar o checkout. Tente novamente.');
    }
  };

  const handlePlanAction = async (planId: PlanId) => {
    if (!isLogged) {
      navigate(`/register?plan=${planId}&cycle=${billingCycle}`);
      return;
    }

    if (planId === currentPlanId) return;

    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    await handleCheckout(planId);
  };

  return (
    <main className="plans-page">
      <section className="plans-hero">
        <div className="plans-hero-copy">
          <Badge className="plans-eyebrow">
            <Sparkles size={12} />
            Planos
          </Badge>
          <h1>{isLogged ? 'Ajuste o plano do seu workspace.' : 'Escolha como quer começar.'}</h1>
          <p>
            {isLogged
              ? 'Seu plano atual fica visível aqui. Freemium continua disponível; Pro e Team seguem para o checkout Yampi.'
              : 'Crie a conta pelo Freemium ou selecione Pro/Team antes do cadastro. O pagamento vem depois da conta criada.'}
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
          const isCurrentPlan = isLogged && currentPlanId === plan.id;

          if (plan.id === 'free') {
            return (
              <Card key={plan.id} className="plan-card plan-card--free">
                <div className="plan-card__head">
                  <div>
                    <p className="plan-card__eyebrow">{plan.eyebrow}</p>
                    <h2>{plan.name}</h2>
                  </div>
                  <Badge>{isCurrentPlan ? 'Plano atual' : 'Grátis'}</Badge>
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
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Você está no Freemium' : isLogged ? 'Usar Freemium' : plan.ctaLabel}
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
                  {isCurrentPlan ? 'Plano atual' : billingCycleCopy[billingCycle].label}
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
                  onClick={() => handlePlanAction(plan.id as PlanId)}
                  disabled={isCurrentPlan || !checkoutUrl}
                >
                  {isCurrentPlan
                    ? `Você está no ${plan.name}`
                    : isLogged
                      ? checkoutUrl ? `Assinar ${plan.name}` : 'Checkout indisponível'
                      : `Escolher ${plan.name}`}
                </Button>
                <span className="plan-card__footer-note">
                  {isLogged
                    ? 'Você pode cancelar a renovação sem perder o período já pago.'
                    : 'A conta é criada antes do checkout para vincular o pagamento ao seu e-mail.'}
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
