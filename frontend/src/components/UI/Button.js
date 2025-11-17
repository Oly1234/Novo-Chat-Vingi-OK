import React from 'react';
import './Button.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon,
  onClick, 
  disabled,
  fullWidth,
  type = 'button',
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`vingi-button vingi-button--${variant} vingi-button--${size} ${fullWidth ? 'vingi-button--full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="vingi-button__icon">{icon}</span>}
      <span className="vingi-button__text">{children}</span>
    </button>
  );
};
