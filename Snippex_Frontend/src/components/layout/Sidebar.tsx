import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileCode, Compass, Library, Plus, Settings, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';

const PUBLIC_NAV = [
  { to: '/dashboard', label: 'Comunidade', icon: Compass },
];

const PRIVATE_NAV = [
  { to: '/my-snippets', label: 'Meus Snippets', icon: Library },
  { to: '/new', label: 'Novo Snippet', icon: Plus },
  { to: '/settings', label: 'Configurações', icon: Settings },
];

const Sidebar: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  const userLogged = (): boolean => {
    const userStorage = localStorage.getItem('user');
    return userStorage !== null && userStorage !== '';
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setUserName(JSON.parse(user).name);
      } catch {
        setUserName('');
      }
    }
  }, []);

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
          <FileCode size={20} />
          <span>snippex</span>
        </div>

        <nav className="sidebar-nav">
          {/* Público */}
          {PUBLIC_NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item ${location.pathname === to ? 'active' : ''}`}
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
                className={`nav-item ${location.pathname === to ? 'active' : ''}`}
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

          <button onClick={handleLogout} className="logout-link">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;