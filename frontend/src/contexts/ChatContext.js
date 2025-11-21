import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  
  // Use ref para ter acesso ao valor mais recente
  const sessionIdRef = useRef(null);
  
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const data = await chatAPI.startSession();
        console.log('Session started:', data.sessionId);
        setSessionId(data.sessionId);
        sessionIdRef.current = data.sessionId;
        setSessionInitialized(true);
      } catch (error) {
        console.error('Failed to start session:', error);
        // Retry once
        setTimeout(async () => {
          try {
            const data = await chatAPI.startSession();
            console.log('Session started (retry):', data.sessionId);
            setSessionId(data.sessionId);
            sessionIdRef.current = data.sessionId;
            setSessionInitialized(true);
          } catch (retryError) {
            console.error('Failed to start session (retry):', retryError);
          }
        }, 1000);
      }
    };

    initSession();
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(async (text, attachments = []) => {
    // Add user message immediately
    const userMessage = {
      sender: 'user',
      text,
      attachments,
      timestamp: new Date()
    };
    addMessage(userMessage);
    
    // Wait for sessionId using ref (acesso ao valor mais recente)
    let currentSessionId = sessionIdRef.current;
    
    if (!currentSessionId) {
      console.log('Waiting for session to initialize...');
      
      // Polling inteligente com ref
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentSessionId = sessionIdRef.current;
        
        if (currentSessionId) {
          console.log('Session ready:', currentSessionId);
          break;
        }
      }
      
      if (!currentSessionId) {
        console.error('Session failed to initialize after 5 seconds');
        addMessage({
          sender: 'ai',
          text: 'Desculpe, houve um problema ao iniciar a conversa. Por favor, recarregue a página.',
          timestamp: new Date()
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // Send to backend with confirmed sessionId
      const response = await chatAPI.sendMessage(currentSessionId, text, attachments);

      // Add AI response
      addMessage({
        sender: 'ai',
        text: response.aiResponse.text,
        timestamp: new Date()
      });

      // Update department if detected
      if (response.department && !currentDepartment) {
        setCurrentDepartment(response.department);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        sender: 'ai',
        text: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentDepartment, addMessage]);

  const value = {
    sessionId,
    messages,
    isLoading,
    currentDepartment,
    sessionInitialized,
    sendMessage,
    addMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
