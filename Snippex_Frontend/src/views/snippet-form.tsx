import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileCode, Sparkles, Globe, Users, Lock, ChevronDown } from 'lucide-react';
import axios from 'axios';
import '../css/snippet-form.css';

import type { Snippet, Visibility } from '../types/snippet';
import { snippetService } from '../services/snippetService';
import SnippetCard from '../components/SnippetCard';
import Button from '../components/ui/Button';

const VIS_OPTIONS: { key: Visibility; label: string; desc: string; icon: typeof Globe }[] = [
  { key: 'PUBLIC', label: 'Público', desc: 'Visível para a comunidade', icon: Globe },
  { key: 'TEAM', label: 'Time', desc: 'Visível apenas para seu time', icon: Users },
  { key: 'PRIVATE', label: 'Privado', desc: 'Visível apenas para você', icon: Lock },
];

const SnippexForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [selectedType, setSelectedType] = useState('code');
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loggedUser, setLoggedUser] = useState<any>(null);

  useEffect(() => {
    const userStorage = localStorage.getItem('user');
    if (userStorage) setLoggedUser(JSON.parse(userStorage));
  }, []);

  useEffect(() => {
    if (id) {
      const loadSnippet = async () => {
        try {
          const snippet = await snippetService.getSnippetsById(id);
          setTitle(snippet.title || '');
          setLanguage(snippet.language || 'JavaScript');
          setContent(snippet.code || '');
          setTags(snippet.tags?.join(', ') || '');
          setSelectedType(snippet.type || 'code');
          setVisibility(snippet.visibility ?? 'PUBLIC');
          setIsLoading(false);
        } catch (error: unknown) {
          console.error('Erro ao carregar snippet:', error);
          alert('Não foi possível carregar o snippet.');
          navigate('/dashboard');
        }
      };
      loadSnippet();
    }
  }, [id, navigate]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const snippet: Snippet = {
      id: id || null,
      user_id: loggedUser.id,
      title,
      type: selectedType,
      language,
      code: content,
      tags: tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      isPublic: visibility === 'PUBLIC',
      visibility,
      explanation: null,
      suggestions: null,
      created_at: null,
      updated_at: null,
      deleted_at: null,
    };

    try {
      if (id) {
        await snippetService.updateSnippet(id, snippet);
        navigate('/dashboard');
      } else {
        const created = await snippetService.postSnippet(snippet);
        // Vai direto pra tela do snippet, onde a análise da IA aparece em loading
        navigate(`/snippet/${created.id}`);
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar snippet:', error);
      const message =
        axios.isAxiosError(error) && typeof error.response?.data?.error === 'string'
          ? error.response.data.error
          : 'Não foi possível salvar o snippet. Tente novamente.';

      alert(message);
    }
  }

  // Snippet "fake" para o preview ao vivo (estilo card da Comunidade)
  const previewSnippet = {
    id: 'preview',
    user_id: loggedUser?.id ?? 0,
    user_name: loggedUser?.name,
    title: title || 'Título do snippet',
    type: selectedType,
    language,
    code: content || '// seu código aparece aqui...',
    isPublic: visibility === 'PUBLIC',
    visibility,
    explanation: null,
    tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    suggestions: null,
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null,
  } as unknown as Snippet;

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="page">
          <p className="page-subtitle">A carregar snippet...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page">
        <div className="page-header">
          <h1>{id ? 'Editar Snippet' : 'Criar Snippet'}</h1>
          <p className="page-subtitle">
            {id ? 'Atualize seu snippet' : 'Salve um novo snippet de código ou prompt de IA'}
          </p>
        </div>

        <div className="form-layout">
          <form className="card" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="title">Título</label>
              <input
                id="title"
                className="input"
                type="text"
                placeholder="ex: React Custom Hook: useDebounce"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Tipo</label>
              <div className="type-toggle" role="group" aria-label="Tipo do snippet">
                <button type="button" className={selectedType === 'code' ? 'active' : ''} onClick={() => setSelectedType('code')}>
                  <FileCode size={16} /> Snippet de Código
                </button>
                <button type="button" className={selectedType === 'prompt' ? 'active' : ''} onClick={() => setSelectedType('prompt')}>
                  <Sparkles size={16} /> Prompt de IA
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="language">Linguagem</label>
              <div className="select-wrapper">
                <select id="language" className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>JavaScript</option>
                  <option>TypeScript</option>
                  <option>Python</option>
                </select>
                <span className="select-arrow"><ChevronDown size={16} /></span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="content">Conteúdo</label>
              <textarea
                id="content"
                className="input code-editor"
                placeholder="Cole seu código aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                className="input"
                type="text"
                placeholder="ex: react, hooks, debounce"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <span className="form-hint">Separe por vírgulas.</span>
            </div>

            <div className="form-field">
              <label>Visibilidade</label>
              <div className="vis-grid">
                {VIS_OPTIONS.map(({ key, label, desc, icon: Icon }) => (
                  <button
                    type="button"
                    key={key}
                    className={`vis-card ${visibility === key ? 'selected' : ''}`}
                    onClick={() => setVisibility(key)}
                    aria-pressed={visibility === key}
                  >
                    <strong><Icon size={14} /> {label}</strong>
                    <span>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <Button variant="primary" type="submit">{id ? 'Atualizar Snippet' : 'Salvar Snippet'}</Button>
              <Button variant="ghost" type="button" onClick={() => navigate('/dashboard')}>Cancelar</Button>
            </div>
          </form>

          <aside className="preview-col">
            <span className="preview-label">Pré-visualização</span>
            <SnippetCard snippet={previewSnippet} onOpen={() => {}} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default SnippexForm;
