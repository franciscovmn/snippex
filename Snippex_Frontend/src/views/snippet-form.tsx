import { useEffect, useState } from 'react';
import '../css/snippet-form.css'

import type { Snippet } from '../types/snippet';

const SnippexForm = () => {
  const [selectedType, setSelectedType] = useState('code');
  const [isPublic, setIsPublic] = useState(true);

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loggedUserName, setLoggedUserName] = useState('');

  useEffect(() => {
  const userStorage = localStorage.getItem("user");

  if (userStorage) {
    const user = JSON.parse(userStorage);
    setLoggedUserName(user.name);
  }
}, []);

  function handleSubmit(e:any) {
    e.preventDefault();

    const snippet:Snippet = {
      id: null,
      user_id: 'AAAA-BBBB-CCCC-DDDD', // usuário tem que ser o usuário logado, isso aqui é só de exemplo
      title: title,
      type: selectedType,
      language: language,
      code: content,
      tags: tags.split(',').map(tag => tag.trim()),
      is_public: isPublic,
      explanation: null,
      suggestions: null,
      created_at: null,
      updated_at: null,
      deleted_at: null
    };

    // TODO: integrar com backend
    console.log("Snippet criado:", snippet);
  }

  return (
    <div className="app-container">
      <main className="main-content">
        <section className="form-container">
          <h2>Criar Snippet</h2>
          <p className="subtitle">Salve um novo snippet de código ou prompt de IA</p>

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
                <div 
                  className={`vis-card ${isPublic === true ? 'selected' : ''}`}
                  onClick={() => setIsPublic(true)}
                >
                  <strong>Público</strong>
                  <span>Visível para a comunidade</span>
                </div>
                <div 
                  className={`vis-card ${isPublic === false ? 'selected' : ''}`}
                  onClick={() => setIsPublic(false)}
                >
                  <strong>Privado</strong>
                  <span>Visível apenas para você</span>
                </div>
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
                Salvar Snippet
              </button>
              <button className="btn-ghost" type="button">
                Cancelar
              </button>
            </div>

          </form>
        </section>
      </main>
    </div>
  );
};

export default SnippexForm;