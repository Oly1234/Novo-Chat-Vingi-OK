import React from 'react';
import { Bot, MessageSquare, Zap, Shield } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import './WelcomeScreen.css';

export const WelcomeScreen = () => {
  const { sendMessage } = useChat();

  const suggestions = [
    'Quero fazer um orçamento',
    'Como funcionam as amostras?',
    'Quero trabalhar na empresa',
    'Falar sobre estampas'
  ];

  const handleSuggestionClick = (text) => {
    sendMessage(text);
  };

  return (
    <div className="vingi-welcome" data-testid="welcome-screen">
      <div className="vingi-welcome__hero">
        <div className="vingi-welcome__icon">
          <Bot size={48} />
        </div>
        <h1 className="vingi-welcome__title">Olá! Bem-vindo à Vingi Têxtil</h1>
        <p className="vingi-welcome__subtitle">
          Estou aqui para ajudar você. Como posso te auxiliar hoje?
        </p>
      </div>

      <div className="vingi-welcome__features">
        <div className="vingi-welcome__feature">
          <MessageSquare size={24} className="vingi-welcome__feature-icon" />
          <h3>Atendimento Inteligente</h3>
          <p>IA treinada para responder suas dúvidas</p>
        </div>
        
        <div className="vingi-welcome__feature">
          <Zap size={24} className="vingi-welcome__feature-icon" />
          <h3>Respostas Rápidas</h3>
          <p>Obtenha informações instantaneamente</p>
        </div>
        
        <div className="vingi-welcome__feature">
          <Shield size={24} className="vingi-welcome__feature-icon" />
          <h3>Suporte 24/7</h3>
          <p>Estamos sempre disponíveis para você</p>
        </div>
      </div>

      <div className="vingi-welcome__suggestions">
        <p className="vingi-welcome__suggestions-title">Tente perguntar:</p>
        <div className="vingi-welcome__suggestion-chips">
          {suggestions.map((suggestion, index) => (
            <button 
              key={index}
              className="vingi-welcome__chip"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
