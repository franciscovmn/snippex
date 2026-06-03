import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ interactive = false, className = '', children, ...rest }) => {
  return (
    <div className={`card ${interactive ? 'card-interactive' : ''} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

export default Card;
