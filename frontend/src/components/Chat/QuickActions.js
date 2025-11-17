import React from 'react';
import { MessageSquarePlus, PhoneCall } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import './QuickActions.css';

export const QuickActions = () => {
  const { requestHandoff, getWhatsAppURL, currentDepartment } = useChat();

  const handleHumanHandoff = async () => {
    await requestHandoff();
  };

  const handleWhatsApp = async () => {
    if (currentDepartment) {
      const url = await getWhatsAppURL(currentDepartment);
      if (url) {
        window.open(url, '_blank');
      }
    }
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
          onClick={handleWhatsApp}
          data-testid="whatsapp-button"
        >
          <PhoneCall size={18} />
          <span>Continuar no WhatsApp</span>
        </button>
      )}
    </div>
  );
};
