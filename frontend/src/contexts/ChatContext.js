import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [chatMode, setChatMode] = useState('ai'); // 'ai' | 'human' | 'whatsapp'
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await chatAPI.startSession();
        setSessionId(session.sessionId);
        console.log('Session started:', session.sessionId);
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    };
    
    if (!sessionId) {
      initSession();
    }
  }, [sessionId]);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, { ...message, id: message.id || Date.now(), timestamp: message.timestamp || new Date() }]);
  }, []);

  const sendMessage = useCallback(async (text, attachments = []) => {
    if (!sessionId) {
      console.error('No session ID');
      return;
    }

    // Add user message
    const userMessage = {
      sender: 'user',
      text,
      attachments,
      timestamp: new Date()
    };
    addMessage(userMessage);

    // Clear uploaded files
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Send to backend
      const response = await chatAPI.sendMessage(sessionId, text, attachments);
      
      // Add AI response
      const aiMessage = {
        sender: 'ai',
        text: response.aiResponse.text,
        timestamp: new Date()
      };
      addMessage(aiMessage);

      // Update department if detected
      if (response.department && !currentDepartment) {
        setCurrentDepartment(response.department);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        sender: 'ai',
        text: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, addMessage, currentDepartment]);

  const uploadFile = useCallback(async (file) => {
    if (!sessionId) return null;

    try {
      const response = await chatAPI.uploadFile(sessionId, file);
      return response;
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  }, [sessionId]);

  const requestHandoff = useCallback(async () => {
    if (!sessionId) return;

    try {
      await chatAPI.requestHandoff(sessionId);
      setChatMode('human');
      addMessage({
        sender: 'system',
        text: 'Você foi adicionado à fila de atendimento. Em breve um atendente entrará em contato.',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to request handoff:', error);
    }
  }, [sessionId, addMessage]);

  const getWhatsAppURL = useCallback(async (department) => {
    if (!sessionId) return null;

    try {
      const response = await chatAPI.getWhatsAppURL(sessionId, department);
      return response.url;
    } catch (error) {
      console.error('Failed to get WhatsApp URL:', error);
      return null;
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setUploadedFiles([]);
    setSessionId(null);
    setCurrentDepartment(null);
    setChatMode('ai');
  }, []);

  const addFile = useCallback((file) => {
    setUploadedFiles(prev => [...prev, file]);
  }, []);

  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      sessionId,
      currentDepartment,
      chatMode,
      uploadedFiles,
      setIsLoading,
      setSessionId,
      setCurrentDepartment,
      setChatMode,
      addMessage,
      sendMessage,
      uploadFile,
      requestHandoff,
      getWhatsAppURL,
      clearChat,
      addFile,
      removeFile
    }}>
      {children}
    </ChatContext.Provider>
  );
};
