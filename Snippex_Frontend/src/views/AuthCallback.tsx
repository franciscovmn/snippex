import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BgCode } from "../components/BgCode";
import { LangNav } from "../components/LangNav";
import { SnippexLogo } from "../components/SnippexLogo";
import { supabase } from "../lib/supabaseClient";
import "../css/form.css";

export default function AuthCallback() {
  const navigate = useNavigate();
  const didStart = useRef(false);
  const [message, setMessage] = useState("Finalizando login com Google...");

  useEffect(() => {
    async function finishLogin() {
      if (didStart.current) {
        return;
      }

      didStart.current = true;

      try {
        if (!supabase) {
          throw new Error("Supabase não configurado");
        }

        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get("error_description") || params.get("error");

        if (oauthError) {
          throw new Error(oauthError);
        }

        if (params.has("code")) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

          if (error) {
            throw error;
          }
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const accessToken = data.session?.access_token;

        if (!accessToken) {
          throw new Error("Sessão Supabase não encontrada");
        }

        const API_URL = import.meta.env.VITE_API_URL;

        if (!API_URL) {
          throw new Error("API_URL não configurada");
        }

        const response = await axios.post(`${API_URL}/api/users/supabase-login`, {
          access_token: accessToken,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error(error);
        setMessage("Não foi possível concluir o login com Google.");

        window.setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2200);
      }
    }

    finishLogin();
  }, [navigate]);

  return (
    <>
      <BgCode />

      <header className="site-header">
        <SnippexLogo />
        <LangNav />
      </header>

      <main className="page-layout">
        <section className="hero" aria-labelledby="auth-callback-heading">
          <h1 id="auth-callback-heading" className="hero__headline">
            Snippex
          </h1>
          <p className="hero__subline">
            Conectando sua conta ao workspace.
          </p>
        </section>

        <section className="auth-panel" aria-live="polite">
          <h2 className="auth-panel__title">Login Google</h2>
          <p className="auth-panel__subtitle">{message}</p>
        </section>
      </main>
    </>
  );
}
