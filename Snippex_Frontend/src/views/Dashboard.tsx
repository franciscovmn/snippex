import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';

const Dashboard: React.FC = () => {
  const [communitySnippets, setCommunitySnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    const fetchCommunitySnippets = async () => {
      try {
        // AQUI você deve chamar o serviço que traz todos os snippets públicos da comunidade
        // Se ainda não existir na API, você precisará criá-lo.
        const publicSnippets: Snippet[] = await snippetService.getAllSnippets(); 
        setCommunitySnippets(publicSnippets);
      } catch (error: unknown) {
        console.error("Erro a buscar snippets da comunidade:", error);
      }
    };

    fetchCommunitySnippets();
  }, []);

  return (
    <main className="main-content">
      <div className="content-header">
        <h1>Dashboard (Comunidade)</h1>
        <Link to="/new" className="btn-new">
          + Novo Snippet
        </Link>
      </div>

      <section className="content-area">
        <h2>Snippets Recentes</h2>
        <p className="subtitle">Explore {communitySnippets.length} snippets da comunidade</p>

        {/* A MUDANÇA COMEÇA AQUI: Adicionando o Grid */}
        <div className="snippets-grid">
          {communitySnippets.length === 0 ? (
            <div className="no-snippets">
              <p>Nenhum snippet público encontrado ainda.</p>
            </div>
          ) : (
            communitySnippets.map((snippet) => (
              <div key={snippet.id} className="snippet-card">
                <div className="card-header">
                  {/* Correção do Autor: Tentamos pegar do objeto user enviado pelo backend */}
                  <span className="author">por {snippet.user?.name || "Anônimo"}</span> 
                  <div className="card-header-tags">
                    <span className="language">{snippet.language}</span>
                  </div>
                </div>

                <h3>{snippet.title}</h3>

                <pre className="code-preview">
                  <code>{snippet.code?.substring(0, 150)}...</code>
                </pre>
                
                <div className="card-footer">
                  <span className="type-label">{snippet.type === 'code' ? '💻' : '🤖'} {snippet.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;