import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TopBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/dashboard`);
    }
  };

  return (
    <header className="topbar">
      <form className="search-container" onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Pesquisar snippets..." 
          className="search-input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
      
      <div className="topbar-actions">
        <Link to="/new" className="btn-new" style={{ padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '4px' }}>
          + Novo Snippet
        </Link>
      </div>
    </header>
  );
};

export default TopBar;