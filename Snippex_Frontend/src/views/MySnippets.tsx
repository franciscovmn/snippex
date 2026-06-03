import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';
import SnippetCard from '../components/SnippetCard';

type VisFilter = 'ALL' | 'PUBLIC' | 'PRIVATE' | 'TEAM';

const FILTERS: { key: VisFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PUBLIC', label: 'Públicos' },
  { key: 'PRIVATE', label: 'Privados' },
  { key: 'TEAM', label: 'Time' },
];

const MySnippets: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filter, setFilter] = useState<VisFilter>('ALL');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        const mySnippets: Snippet[] = await snippetService.getMySnippets();
        setSnippets(mySnippets);
      } catch (error) {
        console.error('Erro a buscar snippets:', error);
      }
    };
    fetchSnippets();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string | undefined | null) => {
    e.stopPropagation();
    if (!id) return;
    if (!window.confirm('Tem a certeza que deseja eliminar este snippet?')) return;
    try {
      await snippetService.deleteSnippet(id);
      setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
    } catch (error) {
      alert('Não foi possível eliminar o snippet.');
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string | undefined | null) => {
    e.stopPropagation();
    if (!id) return;
    navigate(`/edit/${id}`);
  };

  const filteredSnippets = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return snippets.filter((snippet) => {
      const matchesVis = filter === 'ALL' || snippet.visibility === filter;
      const matchesSearch =
        !searchQuery ||
        snippet.title.toLowerCase().includes(lowerQuery) ||
        (snippet.tags && snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) ||
        snippet.language?.toLowerCase().includes(lowerQuery);
      return matchesVis && matchesSearch;
    });
  }, [snippets, filter, searchQuery]);

  return (
    <main className="main-content">
      <div className="page">
        <div className="page-header">
          <h1>Meus Snippets</h1>
          <p className="page-subtitle">
            {searchQuery ? `Resultados da busca por "${searchQuery}"` : `${snippets.length} snippets criados`}
          </p>

          <div className="filter-bar">
            {FILTERS.map(({ key, label }) => (
              <button key={key} className={`chip ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="snippets-grid">
          {filteredSnippets.length === 0 ? (
            <div className="empty-state">Nenhum snippet encontrado.</div>
          ) : (
            filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onOpen={() => navigate(`/snippet/${snippet.id}`)}
                showActions
                onEdit={(e) => handleEdit(e, snippet.id)}
                onDelete={(e) => handleDelete(e, snippet.id)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default MySnippets;
