import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/dashboard.css';
import type { Snippet } from '../types/snippet';

import { snippetService } from '../services/snippetService';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  const snippetsLocal: Snippet[] = [
    {
      id: "1",
      user_id: "alexchen",
      title: "React Custom Hook: useDebounce",
      type: "snippet",
      language: "TYPESCRIPT",
      code:
        "import { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);",
      is_public: true,
      explanation:
        "Este hook customizado do React atrasa a atualização de um valor até que um tempo especificado tenha passado desde a última alteração.",
      tags: ["#react", "#hooks", "#typescript"],
      suggestions: null,
      created_at: new Date("2025-01-01"),
      updated_at: null,
      deleted_at: null,
    },
    {
      id: "2",
      user_id: "alexchen",
      title: "AI Prompt: Code Review Assistant",
      type: "prompt",
      language: "PROMPT",
      code:
        "You are an expert code reviewer. Analyze the following code and provide structured feedback.",
      is_public: true,
      explanation:
        "Este prompt transforma qualquer LLM em um revisor de código estruturado.",
      tags: ["#ai-prompt", "#code-review", "#productivity"],
      suggestions: null,
      created_at: new Date("2025-01-01"),
      updated_at: null,
      deleted_at: null,
    }
  ];

  // TODO: Resolver depois

  /*
  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const mySnippets: Snippet[] = await snippetService.getMySnippets();
        setSnippets(mySnippets);
        console.log("snippet enviado!");
      } catch (error: unknown) {
        console.log("erro buscar snippets " + error);
      }
    };

    fetchSnippets();
  }, []);
  */

  useEffect(() => {
    setUserName("Alex Chen");
    setSnippets(snippetsLocal);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">🧬 snippex</div>

        <nav className="nav-menu">
          <div className="nav-item">🏠 Início</div>
          <div className="nav-item">🧭 Explorar</div>
          <div className="nav-item active">📂 Meus Snippets</div>
          <div className="nav-item">🔖 Salvos</div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item">⚙️ Configurações</div>
          <div className="theme-toggle">☀️ Modo claro</div>

          <div className="profile-section">
            <span className="avatar">👤</span>
            <div className="profile-info">
              <span className="name">{userName}</span>
              <span className="badge">PRO</span>
            </div>
            <span className="logout">➡️</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Buscar snippets..." />
            <kbd>⌘ K</kbd>
          </div>

          <Link to="/new" className="btn-new">
            + Novo Snippet
          </Link>
        </header>

        <section className="content-area">
          <h2>Meus Snippets</h2>
          <p className="subtitle">{snippets.length} snippets</p>

          <br />

          {snippets.map((snippet) => (
            <div key={snippet.id} className="snippet-card">
              {/* Header */}
              <div className="card-header">
                <div className="author-info">
                  <span className="avatar-small">👤</span>
                  <div>
                    <strong>@{snippet.user_id}</strong>
                  </div>
                </div>

                <div className="card-labels">
                  <span className="label-lang">{snippet.language}</span>
                  <span className="label-status">
                    {snippet.is_public ? "🟢 público" : "🔒 privado"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3>{snippet.title}</h3>

              {/* Code */}
              <div className="code-block">
                <pre>
                  <code>{snippet.code}</code>
                </pre>
                <div className="code-expand">⌄ Ver completo</div>
              </div>

              {/* Explanation */}
              <p className="description">
                <span className="ai-sparkle">✨</span> {snippet.explanation}
              </p>

              {/* Tags */}
              <div className="tags">
                {snippet.tags?.map((tag: string) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              {/* Footer */}
              <div className="card-footer">
                <div className="stats">
                  <span>🔖</span>
                </div>
                <div className="share">🔗</div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;