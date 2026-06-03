import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout: React.FC = () => {
  return (
    <div className="app-wrapper">
      <TopBar />
      <div className="dashboard-container">
        <Sidebar />
        {/* O Outlet renderiza as páginas (Dashboard, MySnippets, etc.) */}
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
