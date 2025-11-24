import React from 'react';
import './Card.css';

const Card = ({ children, className = '', title, subtitle, actions, padding = 'default' }) => {
  return (
    <div className={`admin-card ${className}`}>
      {(title || actions) && (
        <div className="admin-card-header">
          <div className="admin-card-header-content">
            {title && <h3 className="admin-card-title">{title}</h3>}
            {subtitle && <p className="admin-card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="admin-card-actions">{actions}</div>}
        </div>
      )}
      <div className={`admin-card-body admin-card-body--${padding}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;