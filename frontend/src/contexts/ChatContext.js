import React, { createContext, useContext, useState, useCallback } from 'react';

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

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, { ...message, id: Date.now(), timestamp: new Date() }]);
  }, []);

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
      clearChat,
      addFile,
      removeFile
    }}>
      {children}
    </ChatContext.Provider>
  );
};
