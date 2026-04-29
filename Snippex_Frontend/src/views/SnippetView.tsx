import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { snippetService } from '../services/snippetService';
import type { Snippet } from '../types/snippet';

const SnippetView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSnippet = async () => {
      try {
        if (id) {
          const data = await snippetService.getSnippetsById(id);
          setSnippet(data);
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o snippet.');
      } finally {
        setIsLoading(false);
      }
    };
    loadSnippet();
  }, [id]);

  if (isLoading) {
    return (
      <main className="main-content">
        <section className="content-area">
          <p>A carregar snippet...</p>
        </section>
      </main>
    );
  }

  if (error || !snippet) {
    return (
      <main className="main-content">
        <section className="content-area">
          <p>{error || 'Snippet não encontrado.'}</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>Voltar</button>
        </section>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="content-header">
        <h1>{snippet.title}</h1>
        <button className="btn-ghost" onClick={() => navigate(-1)}>Voltar</button>
      </div>

      <section className="content-area">
        <div className="snippet-detail-header" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="author">por {(snippet as any).user_name || "Anônimo"}</span>
          <span className="language">{snippet.language}</span>
          <span className="type-label">{snippet.type === 'code' ? '💻' : '🤖'} {snippet.type}</span>
          <span>🔖 {snippet.isPublic || (snippet as any).is_public ? '🌐 Público' : '🔒 Privado'}</span>
        </div>

        {snippet.tags && snippet.tags.length > 0 && (
          <div className="tags" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            {snippet.tags.map(tag => (
              <span key={tag} style={{ background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="code-container" style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
          <pre>
            <code>{snippet.code}</code>
          </pre>
        </div>

        {snippet.explanation && (
          <div className="ai-box" style={{ marginTop: '2rem' }}>
            <span className="ai-emoji">✨</span>
            <div className="ai-text">
              <strong>Explicação da IA</strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>{snippet.explanation}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default SnippetView;
