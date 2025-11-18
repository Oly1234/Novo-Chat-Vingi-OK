import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { notificationService } from '../services/notification';

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
  const [queuePosition, setQueuePosition] = useState(0);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [candidateData, setCandidateData] = useState(null);

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
      const response = await chatAPI.requestHandoff(sessionId);
      setChatMode('human');
      // Simular posição na fila (1-5)
      const position = Math.floor(Math.random() * 5) + 1;
      setQueuePosition(position);
      
      addMessage({
        sender: 'system',
        text: `Você foi adicionado à fila de atendimento. Você é o ${position}º na fila. Em breve um atendente entrará em contato.`,
        timestamp: new Date()
      });
      
      // Simular redução da fila
      const interval = setInterval(() => {
        setQueuePosition(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            addMessage({
              sender: 'system',
              text: 'Um atendente está pronto para te atender!',
              timestamp: new Date()
            });
            return 0;
          }
          return prev - 1;
        });
      }, 15000); // Reduz 1 posição a cada 15s
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
      queuePosition,
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
