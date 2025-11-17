import React from 'react';
import { Bot } from 'lucide-react';
import './LoadingDots.css';

export const LoadingDots = () => {
  return (
    <div className="vingi-loading" data-testid="loading-indicator">
      <div className="vingi-loading__avatar">
        <Bot size={16} />
      </div>
      <div className="vingi-loading__bubble">
        <div className="vingi-loading__dots">
          <span className="vingi-loading__dot"></span>
          <span className="vingi-loading__dot"></span>
          <span className="vingi-loading__dot"></span>
        </div>
      </div>
    </div>
  );
};
