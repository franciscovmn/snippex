import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Library,
  Plus,
  Settings,
  LogOut,
  Bookmark,
  CreditCard,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import { SnippexLogo } from '../SnippexLogo';

const PUBLIC_NAV = [
  { to: '/dashboard', label: 'Comunidade', icon: Compass },
  { to: '/plans', label: 'Planos', icon: CreditCard },
];

const PRIVATE_NAV = [
  { to: '/my-snippets', label: 'Meus Snippets', icon: Library },
  { to: '/saved', label: 'Salvos', icon: Bookmark },
  { to: '/new', label: 'Novo Snippet', icon: Plus },
  { to: '/settings', label: 'Configurações', icon: Settings },
];

const Sidebar: React.FC = () => {
  const [userName] = useState<string>(() => {
    const user = localStorage.getItem('user');

    if (!user) return '';

    try {
      const parsedUser = JSON.parse(user);
      return parsedUser.name || '';
    } catch {
      return '';
    }
  });
  const location = useLocation();
  const navigate = useNavigate();

  const userLogged = (): boolean => {
    const userStorage = localStorage.getItem('user');
    return userStorage !== null && userStorage !== '';
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <SnippexLogo to="/dashboard" />
        </div>

        <nav className="sidebar-nav">
          {/* Público */}
          {PUBLIC_NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item ${
                location.pathname === to ? 'active' : ''
              }`}
              aria-current={location.pathname === to ? 'page' : undefined}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          {/* Privado */}
          {userLogged() &&
            PRIVATE_NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-item ${
                  location.pathname === to ? 'active' : ''
                }`}
                aria-current={location.pathname === to ? 'page' : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Avatar name={userName} size={28} />
            <span className="sidebar-user-name">
              {userName || 'Visitante'}
            </span>
          </div>

          {userLogged() && (
            <button
              type="button"
              onClick={handleLogout}
              className="logout-link"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
