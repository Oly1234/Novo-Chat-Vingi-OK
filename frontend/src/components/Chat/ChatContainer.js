import React, { useState } from 'react';
import { MessageCircle, Moon, Sun, Settings, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useChat } from '../../contexts/ChatContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickActions } from './QuickActions';
import { WelcomeScreen } from './WelcomeScreen';
import { FileUploadModal } from './FileUploadModal';
import { RatingModal } from './RatingModal';
import './ChatContainer.css';

export const ChatContainer = () => {
  const { isDark, toggleTheme } = useTheme();
  const { 
    messages, 
    chatMode, 
    clearChat,
    showFileUpload,
    showRating,
    candidateData,
    setShowFileUpload,
    setShowRating,
    uploadResume,
    submitRating
  } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Button (Mobile/Desktop) */}
      {!isChatOpen && (
        <button 
          className="vingi-chat-fab"
          onClick={handleToggleChat}
          data-testid="open-chat-button"
        >
          <MessageCircle size={24} />
          <span className="vingi-chat-fab__text">Precisa de ajuda?</span>
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className={`vingi-chat-container ${isMinimized ? 'vingi-chat-container--minimized' : ''}`}>
          {/* Header */}
          <div className="vingi-chat-header">
            <div className="vingi-chat-header__left">
              <div className="vingi-chat-header__logo">
                <img src="/logo.png" alt="Vingi" />
              </div>
              <div className="vingi-chat-header__info">
                <h3 className="vingi-chat-header__title">Vingi Têxtil</h3>
                <p className="vingi-chat-header__status">
                  {chatMode === 'ai' && 'Assistente Virtual'}
                  {chatMode === 'human' && 'Atendimento Humano'}
                  {chatMode === 'whatsapp' && 'Redirecionando...'}
                </p>
              </div>
            </div>
            <div className="vingi-chat-header__actions">
              <button 
                className="vingi-chat-header__button"
                onClick={toggleTheme}
                title={isDark ? 'Modo Claro' : 'Modo Escuro'}
                data-testid="theme-toggle-button"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                className="vingi-chat-header__button"
                onClick={handleMinimize}
                title="Minimizar"
              >
                <Settings size={18} />
              </button>
              <button 
                className="vingi-chat-header__button vingi-chat-header__button--close"
                onClick={handleToggleChat}
                title="Fechar"
                data-testid="close-chat-button"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              <div className="vingi-chat-body">
                {messages.length === 0 ? (
                  <WelcomeScreen />
                ) : (
                  <MessageList />
                )}
              </div>

              {/* QuickActions sempre visível quando há mensagens */}
              {messages.length > 0 && (
                <QuickActions />
              )}

              <ChatInput />
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <FileUploadModal
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onUpload={uploadResume}
        candidateData={candidateData}
      />

      <RatingModal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={submitRating}
      />
    </>
  );
};
