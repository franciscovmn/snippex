import { useState } from "react";
import { SnippexLogo } from "../components/SnippexLogo";
import { LangNav } from "../components/LangNav";
import { BgCode } from "../components/BgCode";
import { GithubIcon } from "../components/GithubIcon";
import "../css/form.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrar com backend
    console.log({ fullName, username, email, password, confirm });
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

        {/* ── Coluna direita: formulário de registro ── */}
        <section className="auth-panel" aria-labelledby="register-heading">
          <h2 id="register-heading" className="auth-panel__title">Criar sua conta</h2>
          <p className="auth-panel__subtitle">
            Começa a guardar e compartilhar snippets de código.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Nome completo + Usuário */}
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

            {/* E-mail */}
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

            {/* Senha + Confirmar */}
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

          <p className="divider-text" role="separator"><span>ou</span></p>

          <button className="btn-github btn--full" type="button">
            <GithubIcon />
            Continuar com o GitHub
          </button>

          <p className="auth-footer">
            Você tem uma conta?{" "}
            <a href="/login" className="link-accent">Iniciar sessão</a>
          </p>
        </section>
      </main>
    </>
  );
}
