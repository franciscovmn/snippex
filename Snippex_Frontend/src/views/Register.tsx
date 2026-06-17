import { useState } from "react";
import { SnippexLogo } from "../components/SnippexLogo";
import { LangNav } from "../components/LangNav";
import { BgCode } from "../components/BgCode";
import { GoogleIcon } from "../components/GoogleIcon";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getCheckoutUrl,
  getPlanById,
  normalizePlanId,
  planCatalog,
} from "../lib/subscriptionPlans.js";
import { supabase } from "../lib/supabaseClient";
import type { BillingCycle, PlanId } from "../lib/subscriptionPlans";
import "../css/form.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    normalizePlanId(searchParams.get("plan"))
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    searchParams.get("cycle") === "yearly" ? "yearly" : "monthly"
  );
  const navigate = useNavigate();
  const selectedPlanDetails = getPlanById(selectedPlan);
  const selectedCheckoutUrl = getCheckoutUrl(selectedPlan, billingCycle);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (password !== confirm) {
    alert("As senhas não coincidem.");
    return;
  }

  const API_URL = import.meta.env.VITE_API_URL;

  try {
    await axios.post(`${API_URL}/api/users/register`, {
      name: fullName,
      user_name: username,
      email,
      password,
    });

    if (selectedCheckoutUrl) {
      window.location.assign(selectedCheckoutUrl);
      return;
    }

    alert("Conta criada com sucesso! Faça login para continuar.");
    navigate("/login");
  } catch (error: unknown) {
  console.error("Erro completo:", error);

    alert(
    (axios.isAxiosError(error) && error.response?.data?.error) ||
    (error instanceof Error && error.message) ||
    "Erro ao criar conta."
  );
}
}

  async function handleGoogleRegister() {
    if (!supabase) {
      alert("Supabase ainda não está configurado para login com Google.");
      return;
    }

    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
      setGoogleLoading(false);
      alert("Não foi possível iniciar o cadastro com Google.");
    }
  }

  return (
    <>
      <BgCode />

      <header className="site-header">
        <SnippexLogo />
        <LangNav />
      </header>

      <main className="page-layout">
       
        <section className="hero" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="hero__headline">
            Seu código.<br />Explicado.<br />Compartilhado.
          </h1>
          <p className="hero__subline">
            A comunidade de desenvolvedores para trechos de código e prompts de IA.
          </p>
        </section>

        <section className="auth-panel" aria-labelledby="register-heading">
          <h2 id="register-heading" className="auth-panel__title">Criar sua conta</h2>
          <p className="auth-panel__subtitle">
            Escolha um plano, crie sua conta e comece a organizar seus snippets.
          </p>

          <fieldset className="plan-selector">
            <legend className="plan-selector__label">PLANO DA CONTA</legend>
            <div className="plan-selector__grid">
              {planCatalog.map((plan) => (
                <label
                  key={plan.id}
                  className={`plan-option${selectedPlan === plan.id ? " plan-option--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="selected-plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id)}
                    required
                  />
                  <span className="plan-option__name">{plan.name}</span>
                  <span className="plan-option__meta">{plan.eyebrow}</span>
                </label>
              ))}
            </div>

            {selectedPlan !== "free" && (
              <div className="billing-inline" role="group" aria-label="Ciclo do plano">
                <button
                  type="button"
                  className={billingCycle === "monthly" ? "is-active" : ""}
                  onClick={() => setBillingCycle("monthly")}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  className={billingCycle === "yearly" ? "is-active" : ""}
                  onClick={() => setBillingCycle("yearly")}
                >
                  Anual
                </button>
              </div>
            )}

            <p className="plan-selector__note">
              {selectedPlanDetails.description}
            </p>

            <ul className="plan-selector__limits" aria-label={`Limites do plano ${selectedPlanDetails.name}`}>
              {selectedPlanDetails.highlights.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="plan-selector__note">
              {selectedPlan === "free"
                ? "Freemium cria a conta sem pagamento. Você pode assinar Pro ou Team depois."
                : `Após criar a conta, você seguirá para o checkout ${selectedPlanDetails.name}.`}
            </p>
          </fieldset>

          <form onSubmit={handleSubmit} noValidate>
           
            <div className="field-row">
              <div className="field-group">
                <label className="field-group__label" htmlFor="reg-fullname">Nome completo</label>
                <input
                  className="field-group__input"
                  id="reg-fullname"
                  type="text"
                  name="fullname"
                  placeholder="Alex Chen"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-group__label" htmlFor="reg-username">Usuário</label>
                <input
                  className="field-group__input"
                  id="reg-username"
                  type="text"
                  name="username"
                  placeholder="@Alexchen"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

           
            <div className="field-group">
              <label className="field-group__label" htmlFor="reg-email">E-mail</label>
              <input
                className="field-group__input"
                id="reg-email"
                type="email"
                name="email"
                placeholder="alex@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

          
            <div className="field-row">
              <div className="field-group">
                <label className="field-group__label" htmlFor="reg-password">Senha</label>
                <input
                  className="field-group__input"
                  id="reg-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-group__label" htmlFor="reg-confirm">Confirmar</label>
                <input
                  className="field-group__input"
                  id="reg-confirm"
                  type="password"
                  name="confirm_password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="btn-primary btn--full" type="submit">
              Criar minha conta
            </button>
          </form>

          {selectedPlan === "free" && (
            <>
              <p className="divider-text" role="separator"><span>ou</span></p>

              <button
                className="btn-social btn--full"
                type="button"
                onClick={handleGoogleRegister}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? "Redirecionando..." : "Continuar com Google no Freemium"}
              </button>
            </>
          )}

          <p className="auth-footer">
            Você tem uma conta?{" "}
            <a href="/login" className="link-accent">Iniciar sessão</a>
          </p>
        </section>
      </main>
    </>
  );
}
