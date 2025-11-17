import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { MessageBubble } from './MessageBubble';
import { LoadingDots } from './LoadingDots';
import './MessageList.css';

export const MessageList = () => {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="vingi-message-list" data-testid="message-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="vingi-message-list__loading">
          <LoadingDots />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
