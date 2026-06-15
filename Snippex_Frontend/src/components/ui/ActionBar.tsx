import React from 'react';

interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({ children, className = '' }) => {
  return <div className={`action-bar ${className}`.trim()}>{children}</div>;
};

export default ActionBar;
