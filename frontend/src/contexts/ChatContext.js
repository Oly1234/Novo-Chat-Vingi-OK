import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { chatAPI, ratingsAPI } from '../services/api';
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
    // Add user message immediately for better UX
    const userMessage = {
      sender: 'user',
      text,
      attachments,
      timestamp: new Date()
    };
    addMessage(userMessage);
    
    // Wait for sessionId if not ready yet
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      console.log('Waiting for session to initialize...');
      // Wait up to 3 seconds for session
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (sessionId) {
          currentSessionId = sessionId;
          break;
        }
      }
      
      if (!currentSessionId) {
        console.error('Session failed to initialize');
        addMessage({
          sender: 'ai',
          text: 'Desculpe, houve um problema ao iniciar a conversa. Por favor, recarregue a página.',
          timestamp: new Date()
        });
        return;
      }
    }

    // Clear uploaded files
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Send to backend with the confirmed sessionId
      const response = await chatAPI.sendMessage(currentSessionId, text, attachments);
      
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
        
        // If VAGAS department, start collecting candidate data
        if (response.department === 'VAGAS' && !candidateData) {
          setCandidateData({ sessionId, messages: [] });
        }
      }

      // If VAGAS flow, collect data progressively
      if (currentDepartment === 'VAGAS' && candidateData) {
        const updatedCandidate = { ...candidateData };
        const lowerText = text.toLowerCase();

        // Collect name (if not set and response asks for name)
        if (!updatedCandidate.name && aiMessage.text.toLowerCase().includes('nome completo')) {
          // Name will be collected in next message
        } else if (!updatedCandidate.name && text.trim().length > 3) {
          updatedCandidate.name = text.trim();
        }

        // Collect phone (if name exists and not phone set yet)
        if (updatedCandidate.name && !updatedCandidate.phone && 
            (text.includes('(') || text.match(/\d{10,11}/))) {
          updatedCandidate.phone = text.trim();
        }

        // Collect email
        if (updatedCandidate.name && updatedCandidate.phone && !updatedCandidate.email &&
            text.includes('@')) {
          updatedCandidate.email = text.trim();
        }

        setCandidateData(updatedCandidate);

        // If we have name and phone, submit candidate
        if (updatedCandidate.name && updatedCandidate.phone && !updatedCandidate.id) {
          try {
            const candidateSubmit = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                name: updatedCandidate.name,
                phone: updatedCandidate.phone,
                email: updatedCandidate.email || '',
                position: updatedCandidate.position || '',
                experience: updatedCandidate.experience || '',
                availability: updatedCandidate.availability || ''
              })
            });

            if (candidateSubmit.ok) {
              const result = await candidateSubmit.json();
              setCandidateData({ ...updatedCandidate, id: result.candidateId });
              console.log('Candidate created:', result.candidateId);
            }
          } catch (err) {
            console.error('Failed to create candidate:', err);
          }
        }
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
  }, [sessionId, addMessage, currentDepartment, candidateData]);

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

  const uploadResume = useCallback(async (file) => {
    if (!sessionId || !candidateData) return;

    try {
      const formData = new FormData();
      formData.append('candidateId', candidateData.id);
      formData.append('file', file);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/candidates/upload-resume`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      addMessage({
        sender: 'system',
        text: 'Currículo recebido com sucesso! Nossa equipe de RH analisará seu perfil e entrará em contato em breve.',
        timestamp: new Date()
      });

      setShowFileUpload(false);
      return true;
    } catch (error) {
      console.error('Failed to upload resume:', error);
      throw error;
    }
  }, [sessionId, candidateData, addMessage]);

  const submitRating = useCallback(async (ratingData) => {
    if (!sessionId) return;

    try {
      await ratingsAPI.submitRating(sessionId, ratingData.rating, ratingData.feedback);
      
      addMessage({
        sender: 'system',
        text: 'Obrigado pela sua avaliação! Seu feedback é muito importante para nós.',
        timestamp: new Date()
      });

      setShowRating(false);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  }, [sessionId, addMessage]);

  // Request notification permission on mount
  useEffect(() => {
    notificationService.requestPermission();
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
      showFileUpload,
      showRating,
      candidateData,
      setIsLoading,
      setSessionId,
      setCurrentDepartment,
      setChatMode,
      setShowFileUpload,
      setShowRating,
      setCandidateData,
      addMessage,
      sendMessage,
      uploadFile,
      requestHandoff,
      getWhatsAppURL,
      clearChat,
      addFile,
      removeFile,
      uploadResume,
      submitRating
    }}>
      {children}
    </ChatContext.Provider>
  );
};
