import React from 'react';
import './Card.css';

export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      className={`vingi-card ${hover ? 'vingi-card--hover' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`vingi-card__header ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`vingi-card__body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`vingi-card__footer ${className}`}>{children}</div>
);
