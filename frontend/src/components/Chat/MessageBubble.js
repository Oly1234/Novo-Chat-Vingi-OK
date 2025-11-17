import React from 'react';
import { Bot, User, FileText, Image as ImageIcon, Download } from 'lucide-react';
import './MessageBubble.css';

export const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderAttachment = (attachment) => {
    const isImage = attachment.type.startsWith('image/');
    
    return (
      <div key={attachment.id} className="vingi-message__attachment">
        {isImage ? (
          <div className="vingi-message__image-preview">
            <img src={attachment.url} alt={attachment.name} />
          </div>
        ) : (
          <a 
            href={attachment.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="vingi-message__file"
          >
            <FileText size={20} />
            <span>{attachment.name}</span>
            <Download size={16} />
          </a>
        )}
      </div>
    );
  };

  if (isSystem) {
    return (
      <div className="vingi-message vingi-message--system">
        <p className="vingi-message__text">{message.text}</p>
      </div>
    );
  }

  return (
    <div 
      className={`vingi-message vingi-message--${isUser ? 'user' : 'ai'}`}
      data-testid={`message-${isUser ? 'user' : 'ai'}`}
    >
      <div className="vingi-message__avatar">
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className="vingi-message__content">
        <div className="vingi-message__bubble">
          {message.text && (
            <p className="vingi-message__text">{message.text}</p>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="vingi-message__attachments">
              {message.attachments.map(renderAttachment)}
            </div>
          )}
        </div>
        
        <span className="vingi-message__time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};
