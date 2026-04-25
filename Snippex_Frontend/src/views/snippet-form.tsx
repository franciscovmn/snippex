import { useState } from 'react';
import '../css/form.css'

const SnippexForm = () => {
    const [selectedType, setSelectedType] = useState('snippet');
    const [visibility, setVisibility] = useState('public');

    return (
        <div className="app-container">
        
        <aside className="sidebar">
            <div className="sidebar-top">
            <div className="logo">
                <div className="logo-icon"></div>
                <span>snippex</span>
            </div>
            
            <nav className="nav-menu">
                <div className="nav-item">🏠 Início</div>
                <div className="nav-item">🧭 Explorar</div>
                <div className="nav-item active">📄 Meus Snippets</div>
                <div className="nav-item">🔖 Salvos</div>
                <div className="nav-item">⚙️ Configurações</div>
            </nav>
            </div>

            <div className="sidebar-bottom">
            <div className="nav-item">☀️ Modo claro</div>
            <div className="lang-switcher">
                <span className="active">BR PT</span>
                <span>US EN</span>
                <span>ES ES</span>
            </div>
            <div className="user-profile">
                <div className="avatar">AC</div>
                <div className="user-info">
                <span className="user-name">Alex Chen</span>
                <span className="user-badge">PRO</span>
                </div>
                <div className="logout-emoji">🚪</div>
            </div>
            </div>
        </aside>

        {/* Main Content - Ocupa o resto da tela */}
        <main className="main-content">
            <header className="content-header">
            <div className="search-bar">
                <span>🔍 Buscar snippets...</span>
                <kbd>⌘ K</kbd>
            </div>
            </header>

            <section className="form-container">
            <h2>Criar Snippet</h2>
            <p className="subtitle">Salve um novo snippet de código ou prompt de IA</p>

            <div className="form-group">
                <label>Título</label>
                <input type="text" placeholder="ex: React Custom Hook: useDebounce" />
            </div>

            <div className="form-row">
                <div className="form-group">
                <label>TIPO</label>
                <div className="toggle-group">
                    <button 
                    className={selectedType === 'snippet' ? 'active' : ''} 
                    onClick={() => setSelectedType('snippet')}
                    >
                    Snippet de Código
                    </button>
                    <button 
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
                <select>
                    <option>JavaScript</option>
                    <option>TypeScript</option>
                    <option>Python</option>
                </select>
                <div className="select-arrow">▼</div>
                </div>
            </div>

            <div className="form-group">
                <label>Conteúdo</label>
                <textarea placeholder="Cole seu código aqui..." rows={12}></textarea>
            </div>

            <div className="form-group">
                <label>Tags</label>
                <input type="text" placeholder="Digite uma tag e pressione Enter" />
            </div>

            <div className="form-group">
                <label className="section-label">VISIBILIDADE</label>
                <div className="visibility-options">
                <div 
                    className={`vis-card ${visibility === 'public' ? 'selected' : ''}`}
                    onClick={() => setVisibility('public')}
                >
                    <strong>Público</strong>
                    <span>Visível para a comunidade</span>
                </div>
                <div 
                    className={`vis-card ${visibility === 'private' ? 'selected' : ''}`}
                    onClick={() => setVisibility('private')}
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
                <button className="btn-primary">Salvar Snippet</button>
                <button className="btn-ghost">Cancelar</button>
            </div>
            </section>
        </main>
        </div>
    );
};

export default SnippexForm;