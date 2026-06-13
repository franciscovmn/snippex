import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User } from 'lucide-react';
import Button from '../ui/Button';

const TopBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/dashboard?search=${encodeURIComponent(searchTerm)}` : '/dashboard');
  };

  const userLogged = ():boolean => {
    const userStorage = localStorage.getItem('user');
    return userStorage !== null && userStorage !== "";
  }

  return (
    <header className="topbar">
      <form className="topbar-search" onSubmit={handleSearch} role="search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Pesquisar snippets..."
          aria-label="Pesquisar snippets"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {userLogged() 
        ? (
          <div className="topbar-actions">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={() => navigate('/new')}>
              <span className="btn-label">Novo Snippet</span>
            </Button>
          </div>
        ) 
        
        : (
          <div className="topbar-actions">
            <Button
              variant="primary" size="md" leftIcon={<User size={16} />}  onClick={() => navigate('/login')}
            >
              Fazer login
            </Button>
          </div>
        )
      }
    </header>
  );
};

export default TopBar;
