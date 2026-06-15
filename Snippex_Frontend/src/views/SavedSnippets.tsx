import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';
import SnippetCard from '../components/SnippetCard';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';

type Sort = 'saved' | 'created';

const SavedSnippets: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [activeLang, setActiveLang] = useState('All');
  const [sort, setSort] = useState<Sort>('saved');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
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

  const languages = useMemo(() => {
    const set = new Set<string>();
    snippets.forEach((snippet) => snippet.language && set.add(snippet.language));
    return ['All', ...Array.from(set)];
  }, [snippets]);

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

  const handleUnsave = async (snippet: Snippet) => {
    if (!snippet.id || savingId) return;
    try {
      setSavingId(snippet.id);
      await snippetService.unsaveSnippet(snippet.id);
      setSnippets((current) => current.filter((item) => item.id !== snippet.id));
      showToast('Removido dos salvos');
    } catch {
      showToast('Não foi possível remover dos salvos', 'danger');
    } finally {
      setSavingId(null);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/saved?search=${encodeURIComponent(tag)}`);
  };

  const filteredSnippets = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = snippets.filter((snippet) => {
      const matchesLang = activeLang === 'All' || snippet.language === activeLang;
      const matchesSearch =
        !searchQuery ||
        snippet.title.toLowerCase().includes(lowerQuery) ||
        (snippet.tags && snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) ||
        snippet.language?.toLowerCase().includes(lowerQuery);
      return matchesLang && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const left = new Date((sort === 'saved' ? a.saved_at : a.created_at) ?? 0).getTime();
      const right = new Date((sort === 'saved' ? b.saved_at : b.created_at) ?? 0).getTime();
      return right - left;
    });
  }, [snippets, searchQuery, activeLang, sort]);

  return (
    <main className="main-content">
      <div className="page">
        <PageHeader
          title="Salvos"
          subtitle={searchQuery ? `Resultados da busca por "${searchQuery}"` : `${snippets.length} snippets guardados`}
        >
          <div className="filter-bar">
            {languages.map((lang) => (
              <button key={lang} className={`chip ${activeLang === lang ? 'active' : ''}`} onClick={() => setActiveLang(lang)}>
                {lang}
              </button>
            ))}
            <span className="filter-spacer" />
            <div className="sort-toggle">
              <button className={`chip ${sort === 'saved' ? 'active' : ''}`} onClick={() => setSort('saved')}>
                Salvos recentes
              </button>
              <button className={`chip ${sort === 'created' ? 'active' : ''}`} onClick={() => setSort('created')}>
                Criados recentes
              </button>
            </div>
          </div>
        </PageHeader>

        <div className="snippets-grid">
          {filteredSnippets.length === 0 ? (
            <EmptyState title="Nenhum snippet salvo" description="Salve snippets da comunidade para encontrá-los aqui." />
          ) : (
            filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onOpen={() => navigate(`/snippet/${snippet.id}`)}
                canSave
                copied={copiedId === snippet.id}
                saving={savingId === snippet.id}
                onCopy={() => handleCopy(snippet)}
                onToggleSave={() => handleUnsave(snippet)}
                onTagClick={handleTagClick}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default SavedSnippets;
