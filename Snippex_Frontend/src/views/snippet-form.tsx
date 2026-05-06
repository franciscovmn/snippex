import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/snippet-form.css'

import type { Snippet } from '../types/snippet';
import { snippetService } from '../services/snippetService';

const SnippexForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [selectedType, setSelectedType] = useState('code');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'TEAM' | 'PRIVATE'>('PUBLIC');

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript')
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loggedUserName, setLoggedUserName] = useState('');
  const [loggedUser, setLoggedUser] = useState<any>(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");

    if (userStorage) {
      const user = JSON.parse(userStorage);
      setLoggedUser(user);
      setLoggedUserName(user.name);
    }
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
          console.error("Erro ao carregar snippet:", error);
          alert("Não foi possível carregar o snippet.");
          navigate('/dashboard');
        }
      };
      loadSnippet();
    }
  }, [id, navigate]);

  async function handleSubmit(e:any) {
    e.preventDefault();

    const snippet:Snippet = {
      id: id || null,
      user_id: loggedUser.id,
      title: title,
      type: selectedType,
      language: language,
      code: content,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      isPublic: visibility === 'PUBLIC',
      visibility: visibility, // novo campo adicionado para ter a funcionalidade compativel com a visibilidade da comunidade
      explanation: null,
      suggestions: null,
      created_at: null,
      updated_at: null,
      deleted_at: null
    };
    
    try {
      if (id) {
        await snippetService.updateSnippet(id, snippet);
        console.log("Snippet atualizado com sucesso!");
        alert("Snippet atualizado com sucesso!");
        navigate('/dashboard');
      } else {
        await snippetService.postSnippet(snippet);
        console.log("Snippet criado com sucesso!");
        alert("Snippet criado com sucesso!");
        navigate('/dashboard');
      }
    } catch(error:unknown) {
      console.error("Erro ao salvar snippet:", error);
      alert("Não foi possível salvar o snippet. Tente novamente.");
    }
  }

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <section className="form-container">
          <p>A carregar snippet...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main-content">
      <section className="form-container">
        <h2>{id ? 'Editar Snippet' : 'Criar Snippet'}</h2>
        <p className="subtitle">{id ? 'Atualize seu snippet' : 'Salve um novo snippet de código ou prompt de IA'}</p>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Título</label>
            <input 
              type="text" 
              placeholder="ex: React Custom Hook: useDebounce"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>TIPO</label>
              <div className="toggle-group">
                <button 
                  type="button"
                  className={selectedType === 'code' ? 'active' : ''} 
                  onClick={() => setSelectedType('code')}
                >
                  Snippet de Código
                </button>
                <button 
                  type="button"
                  className={selectedType === 'prompt' ? 'active' : ''} 
                  onClick={() => setSelectedType('prompt')}
                >
                  Prompt de IA
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Linguagem</label>
            <div className="select-wrapper">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>JavaScript</option>
                <option>TypeScript</option>
                <option>Python</option>
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>

          <div className="form-group">
            <label>Conteúdo</label>
            <textarea 
              placeholder="Cole seu código aqui..." 
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input 
              type="text" 
              placeholder="ex: react, hooks, debounce"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="section-label">VISIBILIDADE</label>
        <div className="visibility-options">
          {['PUBLIC', 'TEAM', 'PRIVATE'].map((type) => (
            <div
              key={type}
              className={`vis-card ${visibility === type ? 'selected' : ''}`}
              onClick={() => setVisibility(type as 'PUBLIC' | 'TEAM' | 'PRIVATE')}
            >
              <div className="vis-info">
                <strong>
                  {type === 'PUBLIC' && '🌐 Público'}
                  {type === 'TEAM' && '👥 Time'}
                  {type === 'PRIVATE' && '🔒 Privado'}
                </strong>
                <span>
                  {type === 'PUBLIC' && 'Visível para a comunidade'}
                  {type === 'TEAM' && 'Visível apenas para seu time'}
                  {type === 'PRIVATE' && 'Visível apenas para você'}
                </span>
              </div>
            </div>
          ))}
        </div>
          </div>
          <div className="ai-box">
            <span className="ai-emoji">✨</span>
            <div className="ai-text">
              <strong>Explicação da IA</strong>
              <p>A explicação da IA será gerada automaticamente após salvar</p>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit">
              {id ? 'Atualizar Snippet' : 'Salvar Snippet'}
            </button>
            <button className="btn-ghost" type="button" onClick={handleCancel}>
              Cancelar
            </button>
          </div>

        </form>
      </section>
    </main>
  );
};

export default SnippexForm;