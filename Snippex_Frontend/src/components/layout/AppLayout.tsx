import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import '../../css/dashboard.css'; 

const AppLayout: React.FC = () => {
  return (
    <div className="app-wrapper">
      <TopBar />
      <div className="dashboard-container">
        <Sidebar />
        {/* O Outlet é onde as páginas (Dashboard, MySnippets) vão ser renderizadas */}
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;