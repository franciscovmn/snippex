import React from 'react';

type Variant = 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
  variant?: Variant;
  size?: Size;
}

const IconButton: React.FC<IconButtonProps> = ({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...rest
}) => {
  return (
    <button
      className={`icon-btn icon-btn-${variant} icon-btn-${size} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </button>
  );
};

export default IconButton;
