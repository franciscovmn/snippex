import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';
import SnippetCard from '../components/SnippetCard';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
      showToast('Snippet excluído');
    } catch (error) {
      showToast('Não foi possível excluir o snippet', 'danger');
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string | undefined | null) => {
    e.stopPropagation();
    if (!id) return;
    navigate(`/edit/${id}`);
  };

  const handleCopy = async (snippet: Snippet) => {
    if (!snippet.id) return;
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      showToast('Código copiado', 'success');
      window.setTimeout(() => setCopiedId((current) => (current === snippet.id ? null : current)), 1400);
    } catch {
      showToast('Não foi possível copiar', 'danger');
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/my-snippets?search=${encodeURIComponent(tag)}`);
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
        <PageHeader
          title="Meus Snippets"
          subtitle={searchQuery ? `Resultados da busca por "${searchQuery}"` : `${snippets.length} snippets criados`}
        >

          <div className="filter-bar">
            {FILTERS.map(({ key, label }) => (
              <button key={key} className={`chip ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        </PageHeader>

        <div className="snippets-grid">
          {filteredSnippets.length === 0 ? (
            <EmptyState title="Nenhum snippet encontrado" description="Ajuste os filtros ou crie um novo snippet." />
          ) : (
            filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onOpen={() => navigate(`/snippet/${snippet.id}`)}
                showActions
                copied={copiedId === snippet.id}
                onCopy={() => handleCopy(snippet)}
                onEdit={(e) => handleEdit(e, snippet.id)}
                onDelete={(e) => handleDelete(e, snippet.id)}
                onTagClick={handleTagClick}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default MySnippets;
