import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Cor de destaque opcional (texto + leve fundo). */
  color?: string;
}

const Badge: React.FC<BadgeProps> = ({ color, className = '', style, children, ...rest }) => {
  const colorStyle: React.CSSProperties = color
    ? { color, borderColor: color, ...style }
    : { ...style };
  return (
    <span className={`badge ${className}`.trim()} style={colorStyle} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
