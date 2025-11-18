import React from 'react';
import { MessageSquarePlus, PhoneCall, X, RefreshCw } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import './QuickActions.css';

export const QuickActions = () => {
  const { requestHandoff, getWhatsAppURL, currentDepartment, clearChat, chatMode, queuePosition } = useChat();

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

  const handleRestart = () => {
    if (confirm('Deseja encerrar e iniciar nova conversa?')) {
      clearChat();
      window.location.reload();
    }
  };

  return (
    <div className="vingi-quick-actions" data-testid="quick-actions">
      {chatMode === 'human' && queuePosition > 0 && (
        <div className="vingi-quick-action vingi-quick-action--info">
          <span>🕐 Posição na fila: {queuePosition}</span>
        </div>
      )}
      
      {chatMode === 'ai' && (
        <button 
          className="vingi-quick-action"
          onClick={handleHumanHandoff}
          data-testid="human-handoff-button"
        >
          <MessageSquarePlus size={18} />
          <span>Falar com Atendente</span>
        </button>
      )}
      
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
      
      <button 
        className="vingi-quick-action vingi-quick-action--secondary"
        onClick={handleRestart}
        data-testid="restart-chat-button"
      >
        <RefreshCw size={18} />
        <span>Nova Conversa</span>
      </button>
      
      <button 
        className="vingi-quick-action vingi-quick-action--danger"
        onClick={handleRestart}
        data-testid="exit-chat-button"
      >
        <X size={18} />
        <span>Sair</span>
      </button>
    </div>
  );
};
