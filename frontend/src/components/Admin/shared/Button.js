import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = ''
}) => {
  const classes = [
    'admin-btn',
    `admin-btn--${variant}`,
    `admin-btn--${size}`,
    fullWidth && 'admin-btn--full',
    disabled && 'admin-btn--disabled',
    loading && 'admin-btn--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="admin-btn-spinner" />
      ) : (
        icon && <span className="admin-btn-icon">{icon}</span>
      )}
      {children && <span className="admin-btn-text">{children}</span>}
    </button>
  );
};

export default Button;