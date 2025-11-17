import React from 'react';
import { MessageSquarePlus, PhoneCall } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import './QuickActions.css';

export const QuickActions = () => {
  const { setChatMode, currentDepartment } = useChat();

  const handleHumanHandoff = () => {
    setChatMode('human');
    // TODO: Send handoff request to API
  };

  return (
    <div className="vingi-quick-actions" data-testid="quick-actions">
      <button 
        className="vingi-quick-action"
        onClick={handleHumanHandoff}
        data-testid="human-handoff-button"
      >
        <MessageSquarePlus size={18} />
        <span>Falar com Atendente</span>
      </button>
      
      {currentDepartment && (
        <button 
          className="vingi-quick-action vingi-quick-action--success"
          data-testid="whatsapp-button"
        >
          <PhoneCall size={18} />
          <span>Continuar no WhatsApp</span>
        </button>
      )}
    </div>
  );
};
