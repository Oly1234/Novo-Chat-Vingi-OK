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
    if (window.confirm('Deseja encerrar esta conversa e iniciar um novo atendimento?')) {
      clearChat();
      window.location.reload();
    }
  };

  const handleExit = () => {
    if (window.confirm('Deseja realmente sair do chat? A conversa será encerrada.')) {
      clearChat();
      window.location.reload();
    }
  };

  return (
    <div className="vingi-quick-actions" data-testid="quick-actions">
      {/* Posição na fila - sempre visível quando em modo humano */}
      {chatMode === 'human' && queuePosition > 0 && (
        <div className="vingi-quick-action vingi-quick-action--info">
          <span>🕐 Posição na fila: {queuePosition}º</span>
        </div>
      )}
      
      {/* Botão para falar com atendente - apenas no modo IA */}
      {chatMode === 'ai' && (
        <button 
          className="vingi-quick-action"
          onClick={handleHumanHandoff}
          data-testid="human-handoff-button"
          title="Falar com um atendente humano"
        >
          <MessageSquarePlus size={18} />
          <span>Falar com Atendente</span>
        </button>
      )}
      
      {/* Botão WhatsApp - aparece quando departamento é identificado */}
      {currentDepartment && (
        <button 
          className="vingi-quick-action vingi-quick-action--success"
          onClick={handleWhatsApp}
          data-testid="whatsapp-button"
          title="Continuar a conversa no WhatsApp"
        >
          <PhoneCall size={18} />
          <span>Continuar no WhatsApp</span>
        </button>
      )}
      
      {/* Botão Nova Conversa - sempre visível */}
      <button 
        className="vingi-quick-action vingi-quick-action--secondary"
        onClick={handleRestart}
        data-testid="restart-chat-button"
        title="Cancelar e iniciar nova conversa"
      >
        <RefreshCw size={18} />
        <span>Cancelar</span>
      </button>
      
      {/* Botão Sair - sempre visível */}
      <button 
        className="vingi-quick-action vingi-quick-action--danger"
        onClick={handleExit}
        data-testid="exit-chat-button"
        title="Sair do chat"
      >
        <X size={18} />
        <span>Sair</span>
      </button>
    </div>
  );
};
