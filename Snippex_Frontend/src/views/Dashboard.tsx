import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';

const Dashboard: React.FC = () => {
  const [communitySnippets, setCommunitySnippets] = useState<Snippet[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCommunitySnippets = async () => {
      try {
        const publicSnippets: Snippet[] = await snippetService.getAllSnippets(); 
        setCommunitySnippets(publicSnippets);
      } catch (error: unknown) {
        console.error("Erro a buscar snippets da comunidade:", error);
      }
    };

    fetchCommunitySnippets();
  }, []);

  const filteredSnippets = communitySnippets.filter(snippet => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      snippet.title.toLowerCase().includes(lowerQuery) ||
      (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
      snippet.language?.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <main className="main-content">
      <div className="content-header">
        <h1>Dashboard (Comunidade)</h1>
      </div>

      <section className="content-area">
        <h2>Snippets Recentes</h2>
        <p className="subtitle">
          {searchQuery ? `Resultados da busca por "${searchQuery}"` : `Explore ${communitySnippets.length} snippets da comunidade`}
        </p>

        <div className="snippets-grid">
          {filteredSnippets.length === 0 ? (
            <div className="no-snippets">
              <p>Nenhum snippet encontrado.</p>
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <div 
                key={snippet.id} 
                className="snippet-card" 
                onClick={() => navigate(`/snippet/${snippet.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header">
                  <span className="author">por {(snippet as any).user_name || "Anônimo"}</span> 
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