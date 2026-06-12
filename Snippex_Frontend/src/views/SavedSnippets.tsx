import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';
import SnippetCard from '../components/SnippetCard';

const SavedSnippets: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchSavedSnippets = async () => {
      try {
        const saved: Snippet[] = await snippetService.getSavedSnippets();
        setSnippets(saved);
      } catch (error) {
        console.error('Erro ao buscar snippets salvos:', error);
      }
    };

    fetchSavedSnippets();
  }, []);

  const filteredSnippets = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return snippets.filter((snippet) => {
      return (
        !searchQuery ||
        snippet.title.toLowerCase().includes(lowerQuery) ||
        (snippet.tags && snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) ||
        snippet.language?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [snippets, searchQuery]);

  return (
    <main className="main-content">
      <div className="page">
        <div className="page-header">
          <h1>Salvos</h1>
          <p className="page-subtitle">
            {searchQuery ? `Resultados da busca por "${searchQuery}"` : `${snippets.length} snippets guardados`}
          </p>
        </div>

        <div className="snippets-grid">
          {filteredSnippets.length === 0 ? (
            <div className="empty-state">Nenhum snippet salvo.</div>
          ) : (
            filteredSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} onOpen={() => navigate(`/snippet/${snippet.id}`)} />
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default SavedSnippets;
