import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LayoutDashboard, Settings } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { userService } from '../services/userService';
import type { UserSubscription } from '../services/userService';
import '../css/plans.css';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function refreshSubscription() {
      try {
        const response = await userService.me();
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : {};

        localStorage.setItem('user', JSON.stringify({
          ...parsedUser,
          ...response.user,
        }));

        if (active) {
          setSubscription(response.user.subscription ?? null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoaded(true);
      }
    }

    refreshSubscription();

    return () => {
      active = false;
    };
  }, []);

  const planName = subscription?.plan_id === 'pro'
    ? 'Pro'
    : subscription?.plan_id === 'team'
      ? 'Team'
      : 'Freemium';
  const isActive = subscription?.status === 'active';

  return (
    <main className="plans-page checkout-success-page">
      <section className="plans-hero checkout-success">
        <div className="plans-hero-copy">
          <Badge className="plans-eyebrow">
            <CheckCircle2 size={12} />
            Compra recebida
          </Badge>
          <h1>{isActive ? `Seu plano ${planName} está ativo.` : 'Estamos confirmando seu pagamento.'}</h1>
          <p>
            {isActive
              ? 'A assinatura foi vinculada à sua conta. Você já pode usar os limites do novo plano.'
              : 'A Yampi já recebeu a compra. Se o plano ainda não mudou, aguarde alguns instantes e atualize a página.'}
          </p>
        </div>

        <div className="plans-hero-aside">
          <Button
            variant="primary"
            size="md"
            leftIcon={<LayoutDashboard size={16} />}
            onClick={() => navigate('/dashboard')}
          >
            Ir para o dashboard
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Settings size={16} />}
            onClick={() => navigate('/settings')}
          >
            Ver assinatura
          </Button>
          {!loaded && <p className="plans-cycle-note">Atualizando sua assinatura...</p>}
        </div>
      </section>
    </main>
  );
}
