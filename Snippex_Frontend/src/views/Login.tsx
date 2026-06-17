import { useState } from "react";
import { SnippexLogo } from "../components/SnippexLogo";
import { LangNav } from "../components/LangNav";
import { BgCode } from "../components/BgCode";
import { GoogleIcon } from "../components/GoogleIcon";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../css/form.css";

type DemoRole = "individual" | "equipe" | "empresarial";

export default function Login() {
  const [role, setRole] = useState<DemoRole>("empresarial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const API_URL = import.meta.env.VITE_API_URL;

  try {
    const response = await axios.post(`${API_URL}/api/users/login`, {
      email,
      password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    navigate("/dashboard");
  } catch (error) {
    console.error(error);
    alert("E-mail ou senha inválidos.");
  }
}

  async function handleGoogleLogin() {
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
      alert("Não foi possível iniciar o login com Google.");
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
        {/* ── Coluna esquerda: hero ── */}
        <section className="hero" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="hero__headline">
            Seu código.<br />Explicado.<br />Compartilhado.
          </h1>
          <p className="hero__subline">
            A comunidade de desenvolvedores para trechos de código e prompts de IA.
          </p>
        </section>

        {/* ── Coluna direita: formulário ── */}
        <section className="auth-panel" aria-labelledby="login-heading">
          <h2 id="login-heading" className="auth-panel__title">Faça login</h2>
          <p className="auth-panel__subtitle">Bem-vindo de volta. Digite suas credenciais.</p>

          {/* Papel de demo */}
          <fieldset className="role-selector">
            <legend className="role-selector__label">PAPEL DE DEMO</legend>
            <div className="role-selector__options" role="group">
              {(["individual", "equipe", "empresarial"] as DemoRole[]).map((r) => (
                <label
                  key={r}
                  className={`role-selector__option${role === r ? " role-selector__option--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="demo-role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className="field-group__label" htmlFor="login-email">E-mail</label>
              <input
                className="field-group__input"
                id="login-email"
                type="email"
                name="email"
                placeholder="alex@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-group__label" htmlFor="login-password">Senha</label>
              <input
                className="field-group__input"
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-row form-row--spaced">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Lembre-se de mim</span>
              </label>
              <a href="/recuperar-senha" className="link-accent">Esqueceu a senha?</a>
            </div>

            <button className="btn-primary btn--full" type="submit">
              Faça login
            </button>
          </form>

          <p className="divider-text" role="separator"><span>ou</span></p>

          <button
            className="btn-social btn--full"
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <GoogleIcon />
            {googleLoading ? "Redirecionando..." : "Continuar com Google"}
          </button>

          <br /> 
          
          {/* galera, esse botão aqui serve só pra acessar o Dashboard enquanto ainda não tiver conexão com o banco, a fim de testes */}
          <Link to="/dashboard" className="btn-social btn--full"> Entrar como visitante </Link>

          <Link to="/plans" className="link-accent" style={{ display: 'inline-block', marginTop: '12px' }}>
            Ver planos
          </Link>

          <p className="auth-footer">
            Não tem conta?{" "}
            <a href="/register" className="link-accent">Registro</a>
          </p>
        </section>
      </main>
    </>
  );
}
