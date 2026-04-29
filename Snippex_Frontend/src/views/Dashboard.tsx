import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importar useNavigate
import '../css/dashboard.css';
import type { Snippet } from '../types/snippet';

import { snippetService } from '../services/snippetService';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const navigate = useNavigate(); // Hook para navegação programática

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        let user = localStorage.getItem("user");
        let username = "Alex Chen";

        if (user) {
          username = JSON.parse(user).name;
        }

        setUserName(username);

        const mySnippets: Snippet[] = await snippetService.getMySnippets();
        setSnippets(mySnippets);
      } catch (error: unknown) {
        console.error("Erro a buscar snippets:", error);
      }
    };

    fetchSnippets();
  }, []);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    const isConfirmed = window.confirm("Tem a certeza que deseja eliminar este snippet?");
    if (!isConfirmed) return;

    try {
      await snippetService.deleteSnippet(id);
      
      // Atualiza o estado local filtrando o snippet removido (UI atualiza instantaneamente)
      setSnippets(prevSnippets => prevSnippets.filter(snippet => snippet.id !== id));
    } catch (error) {
      console.error("Erro ao eliminar snippet:", error);
      alert("Não foi possível eliminar o snippet. Tente novamente mais tarde.");
    }
  };

  const handleEdit = (id: string | undefined) => {
    if (!id) return;
    // Redireciona para uma rota de edição, passando o ID do snippet
    navigate(`/edit/${id}`);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <h1>📝 Snippex</h1>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            📚 Meus Snippets
          </Link>
          <Link to="/new" className="nav-item">
            ➕ Novo Snippet
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{userName}</strong>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header com Botão Novo */}
        <div className="content-header">
          <h1>Dashboard</h1>
          <Link to="/new" className="btn-new">
            + Novo Snippet
          </Link>
        </div>

        <section className="content-area">
          <h2>Meus Snippets</h2>
          <p className="subtitle">{snippets.length} snippets</p>

          <br />

          {snippets.length === 0 ? (
            <div className="no-snippets">
              <p>Nenhum snippet criado ainda. <Link to="/new">Crie o seu primeiro snippet!</Link></p>
            </div>
          ) : (
            snippets.map((snippet) => (
              <div key={snippet.id} className="snippet-card">
                {/* Header */}
                <div className="card-header">
                  <span className="author">por {userName}</span>
                  <span className="type-label">{snippet.type === 'code' ? '💻' : '🤖'} {snippet.type}</span>
                  <span className="language">{snippet.language}</span>
                </div>

                {/* Title */}
                <h3>{snippet.title}</h3>

                {/* Code Preview */}
                <pre className="code-preview">
                  <code>{snippet.code?.substring(0, 200)}...</code>
                </pre>

                {/* Tags */}
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="tags">
                    {snippet.tags.map((tag: string, index: number) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer com Ações */}
                <div className="card-footer">
                  <div className="stats">
                    <span>🔖 {snippet.isPublic ? '🌐 Público' : '🔒 Privado'}</span>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="snippet-actions">
                    <button 
                      onClick={() => handleEdit(snippet.id)}
                      className="btn-action btn-edit"
                      title="Editar snippet"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(snippet.id)}
                      className="btn-action btn-delete"
                      title="Eliminar snippet"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>

                  <div className="share">
                    <button className="btn-share" title="Copiar link">
                      🔗 Partilhar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;