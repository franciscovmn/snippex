import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';
import SnippetCard from '../components/SnippetCard';

type Sort = 'recent' | 'popular';

const Dashboard: React.FC = () => {
  const [communitySnippets, setCommunitySnippets] = useState<Snippet[]>([]);
  const [activeLang, setActiveLang] = useState<string>('All');
  const [sort, setSort] = useState<Sort>('recent');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

    // "Recentes" por data; "Populares" não tem métrica no backend ainda,
    // então cai no mesmo critério (placeholder até existir contador).
    return [...list].sort((a, b) => {
      const da = new Date(a.created_at ?? 0).getTime();
      const db = new Date(b.created_at ?? 0).getTime();
      return db - da;
    });
  }, [communitySnippets, activeLang, searchQuery, sort]);

  return (
    <main className="main-content">
      <div className="page">
        <div className="page-header">
          <h1>Comunidade</h1>
          <p className="page-subtitle">
            {searchQuery
              ? `Resultados da busca por "${searchQuery}"`
              : `Explore ${communitySnippets.length} snippets compartilhados pela comunidade`}
          </p>

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
            <span className="filter-spacer" />
            <div className="sort-toggle">
              <button className={`chip ${sort === 'recent' ? 'active' : ''}`} onClick={() => setSort('recent')}>
                Recentes
              </button>
              <button className={`chip ${sort === 'popular' ? 'active' : ''}`} onClick={() => setSort('popular')}>
                Populares
              </button>
            </div>
          </div>
        </div>

        <div className="snippets-grid">
          {filteredSnippets.length === 0 ? (
            <div className="empty-state">Nenhum snippet encontrado.</div>
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

export default Dashboard;
