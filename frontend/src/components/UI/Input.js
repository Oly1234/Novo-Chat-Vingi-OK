import React from 'react';
import './Input.css';

export const Input = ({ 
  label,
  error,
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={`vingi-input-wrapper ${className}`}>
      {label && <label className="vingi-input-label">{label}</label>}
      <div className="vingi-input-container">
        {icon && <span className="vingi-input-icon">{icon}</span>}
        <input 
          className={`vingi-input ${error ? 'vingi-input--error' : ''} ${icon ? 'vingi-input--with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="vingi-input-error">{error}</span>}
    </div>
  );
};

export const TextArea = ({ 
  label,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className={`vingi-input-wrapper ${className}`}>
      {label && <label className="vingi-input-label">{label}</label>}
      <textarea 
        className={`vingi-input vingi-textarea ${error ? 'vingi-input--error' : ''}`}
        {...props}
      />
      {error && <span className="vingi-input-error">{error}</span>}
    </div>
  );
};
