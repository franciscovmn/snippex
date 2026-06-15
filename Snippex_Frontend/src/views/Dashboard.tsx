import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';
import SnippetCard from '../components/SnippetCard';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../components/ui/Toast';

const Dashboard: React.FC = () => {
  const [communitySnippets, setCommunitySnippets] = useState<Snippet[]>([]);
  const [activeLang, setActiveLang] = useState<string>('All');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCommunitySnippets = async () => {
      try {
        const publicSnippets: Snippet[] = await snippetService.getAllSnippets();
        setCommunitySnippets(publicSnippets);
      } catch (error: unknown) {
        console.error('Erro a buscar snippets da comunidade:', error);
      }
    };
    fetchCommunitySnippets();
  }, []);

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

  const handleToggleSave = async (snippet: Snippet) => {
    if (!snippet.id || savingId) return;
    try {
      setSavingId(snippet.id);
      if (snippet.is_saved) {
        await snippetService.unsaveSnippet(snippet.id);
        setCommunitySnippets((current) => current.map((item) => item.id === snippet.id ? { ...item, is_saved: false } : item));
        showToast('Removido dos salvos');
      } else {
        await snippetService.saveSnippet(snippet.id);
        setCommunitySnippets((current) => current.map((item) => item.id === snippet.id ? { ...item, is_saved: true } : item));
        showToast('Snippet salvo', 'success');
      }
    } catch {
      showToast('Não foi possível atualizar os salvos', 'danger');
    } finally {
      setSavingId(null);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/dashboard?search=${encodeURIComponent(tag)}`);
  };

  // Linguagens disponíveis para os chips de filtro
  const languages = useMemo(() => {
    const set = new Set<string>();
    communitySnippets.forEach((s) => s.language && set.add(s.language));
    return ['All', ...Array.from(set)];
  }, [communitySnippets]);

  const filteredSnippets = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const list = communitySnippets.filter((snippet) => {
      const matchesLang = activeLang === 'All' || snippet.language === activeLang;
      const matchesSearch =
        !searchQuery ||
        snippet.title.toLowerCase().includes(lowerQuery) ||
        (snippet.tags && snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) ||
        snippet.language?.toLowerCase().includes(lowerQuery);
      return matchesLang && matchesSearch;
    });

    return [...list].sort((a, b) => {
      const da = new Date(a.created_at ?? 0).getTime();
      const db = new Date(b.created_at ?? 0).getTime();
      return db - da;
    });
  }, [communitySnippets, activeLang, searchQuery]);

  return (
    <main className="main-content">
      <div className="page">
        <PageHeader
          title="Comunidade"
          subtitle={
            searchQuery
              ? `Resultados da busca por "${searchQuery}"`
              : `Explore ${communitySnippets.length} snippets compartilhados pela comunidade`
          }
        >

          <div className="filter-bar">
            {languages.map((lang) => (
              <button
                key={lang}
                className={`chip ${activeLang === lang ? 'active' : ''}`}
                onClick={() => setActiveLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </PageHeader>

        <div className="snippets-grid">
          {filteredSnippets.length === 0 ? (
            <EmptyState title="Nenhum snippet encontrado" description="Ajuste os filtros ou faça uma nova busca." />
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
                onToggleSave={() => handleToggleSave(snippet)}
                onTagClick={handleTagClick}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
