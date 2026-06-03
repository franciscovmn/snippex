import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  leftIcon,
  className = '',
  children,
  ...rest
}) => {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`.trim()} {...rest}>
      {leftIcon && <span className="btn-icon">{leftIcon}</span>}
      {children}
    </button>
  );
};

export default Button;
