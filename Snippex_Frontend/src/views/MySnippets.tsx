import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';

const MySnippets: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        let user = localStorage.getItem("user");
        let username = "Alex Chen";
        if (user) username = JSON.parse(user).name;
        
        setUserName(username);
        const mySnippets: Snippet[] = await snippetService.getMySnippets();
        setSnippets(mySnippets);
      } catch (error) {
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
      setSnippets(prevSnippets => prevSnippets.filter(snippet => snippet.id !== id));
    } catch (error) {
      alert("Não foi possível eliminar o snippet.");
    }
  };

  const handleEdit = (id: string | undefined) => {
    if (!id) return;
    navigate(`/edit/${id}`);
  };

  return (
    <main className="main-content">
      <div className="content-header">
        <h1>Meus Snippets</h1>
        <Link to="/new" className="btn-new">
          + Novo Snippet
        </Link>
      </div>

      <section className="content-area">
        <h2>Gerenciar Snippets</h2>
        <p className="subtitle">{snippets.length} snippets criados</p>
        <br />

        {snippets.length === 0 ? (
          <div className="no-snippets">
            <p>Nenhum snippet criado ainda. <Link to="/new">Crie o seu primeiro snippet!</Link></p>
          </div>
        ) : (
          snippets.map((snippet) => (
            <div key={snippet.id} className="snippet-card">
              <div className="card-header">
                <span className="author">por {userName}</span>
                <span className="type-label">{snippet.type === 'code' ? '💻' : '🤖'} {snippet.type}</span>
                <span className="language">{snippet.language}</span>
              </div>
              <h3>{snippet.title}</h3>
              <pre className="code-preview">
                <code>{snippet.code?.substring(0, 200)}...</code>
              </pre>
              <div className="card-footer">
                <div className="stats">
                  <span>🔖 {snippet.isPublic ? '🌐 Público' : '🔒 Privado'}</span>
                </div>
                <div className="snippet-actions">
                  <button onClick={() => handleEdit(snippet.id)} className="btn-action btn-edit">✏️ Editar</button>
                  <button onClick={() => handleDelete(snippet.id)} className="btn-action btn-delete">🗑️ Eliminar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default MySnippets;