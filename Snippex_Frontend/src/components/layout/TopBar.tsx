import React from 'react';

const TopBar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Pesquisar snippets..." 
          className="search-input" 
        />
      </div>
      
      {/* Botões extras do lado direito (ex: sino de notificação) */}
      <div className="topbar-actions">
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
          🔔
        </button>
      </div>
    </header>
  );
};

export default TopBar;