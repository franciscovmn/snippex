import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/dashboard.css';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState("")
  const [snippets, setSnippets] = useState<any[]>([])
  //galera, esse "any" é meio peba, depois vou criar a interface do Snippet para adicionar aqui

  // dados Hard Coded enquanto ainda não tem conexão com banco
  const snippetsLocal = [
    {
      id: 1,
      author: "@alexchen",
      time: "há cerca de 1 ano",
      title: "React Custom Hook: useDebounce",
      lang: "TYPESCRIPT",
      code: "import { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);",
      description: "Este hook customizado do React atrasa a atualização de um valor até que um tempo especificado tenha passado desde a última alteração.",
      tags: ["#react", "#hooks", "#typescript"],
      likes: 234,
      comments: 18
    },
    {
      id: 2,
      author: "@alexchen",
      time: "há cerca de 1 ano",
      title: "AI Prompt: Code Review Assistant",
      lang: "PROMPT",
      code: "1 You are an expert code reviewer. Analyze the following code and provide:\n2 \n3 1. **Summary**: A one-sentence description of what the code does\n4 2. **Issues**: List any bugs, security vulnerabilities...",
      description: "Este prompt transforma qualquer LLM em um revisor de código estruturado. Ele solicita análise em cinco dimensões.",
      tags: ["#ai-prompt", "#code-review", "#productivity"],
      likes: 567,
      comments: 31
    }
  ];

  //depois remover isso aqui quando adicionar conexão com o banco
  useEffect(() => {
    setUserName("Alex Chen")
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
          <Link to="/new" className="btn-new"> + Novo Snippet </Link>
        </header>

        <section className="content-area">
          <h2>Meus Snippets</h2>
          <p className="subtitle">{snippets.length} snippets</p>
          <br />

          {snippets.map(snippet => (
            <div key={snippet.id} className="snippet-card">
              <div className="card-header">
                <div className="author-info">
                  <span className="avatar-small">👤</span>
                  <div>
                    <strong>{snippet.author}</strong>
                    <span className="time-ago"> {snippet.time}</span>
                  </div>
                </div>
                <div className="card-labels">
                  <span className="label-lang">{snippet.lang}</span>
                  <span className="label-status">🟢 público</span>
                </div>
              </div>

              <h3>{snippet.title}</h3>

              <div className="code-block">
                <pre><code>{snippet.code}</code></pre>
                <div className="code-expand">⌄ Ver completo</div>
              </div>

              <p className="description">
                <span className="ai-sparkle">✨</span> {snippet.description}
              </p>

              <div className="tags">
                {/*
                {snippet.tags.map(tag => <span key={tag}>{tag}</span>)} concertar isso dps
                */}
  
                {snippet.tags.map((tag: string) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="card-footer">
                <div className="stats">
                  <span>🤍 {snippet.likes}</span>
                  <span>💬 {snippet.comments}</span>
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