import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let user = localStorage.getItem("user");
    if (user) {
      setUserName(JSON.parse(user).name);
    }
  }, []);

  const handleLogout = () => {
    // Confirma se o usuário quer sair
    if(window.confirm("Deseja realmente sair?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login"); // Manda de volta pra tela de login
    }
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-section">
          <span className="logo-icon">&lt;&gt;</span>
          <h1>snippex</h1>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            🧭 Comunidade
          </Link>
          <Link to="/my-snippets" className={`nav-item ${location.pathname === '/my-snippets' ? 'active' : ''}`}>
            📚 Meus Snippets
          </Link>
          <Link to="/new" className={`nav-item ${location.pathname === '/new' ? 'active' : ''}`}>
            ➕ Novo Snippet
          </Link>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="user-info">
          👤 <strong>{userName || "Visitante"}</strong>
        </div>
        
        <button onClick={handleLogout} className="btn-logout">
          🚪 Sair da conta
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;