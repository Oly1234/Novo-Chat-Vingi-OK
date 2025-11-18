import React from 'react';
import './TypingIndicator.css';

export const TypingIndicator = () => {
  return (
    <div className="typing-indicator" data-testid="typing-indicator">
      <div className="typing-indicator__avatar">
        <img src="/logo.png" alt="Vingi" />
      </div>
      <div className="typing-indicator__bubble">
        <div className="typing-indicator__dot" />
        <div className="typing-indicator__dot" />
        <div className="typing-indicator__dot" />
      </div>
    </div>
  );
};
