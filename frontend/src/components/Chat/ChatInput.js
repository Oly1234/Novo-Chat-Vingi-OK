import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import './ChatInput.css';

export const ChatInput = () => {
  const { addMessage, uploadedFiles, addFile, removeFile, isLoading, setIsLoading, chatMode } = useChat();
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    if (isLoading) return;

    const message = {
      sender: 'user',
      text: inputValue.trim(),
      attachments: uploadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        url: f.url || URL.createObjectURL(f.file)
      }))
    };

    addMessage(message);
    setInputValue('');
    
    // Clear files immediately for better UX
    uploadedFiles.forEach(f => removeFile(f.id));

    // TODO: Send to API - will be integrated with backend
    // Simulate AI response for now
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addMessage({
        sender: 'ai',
        text: 'Obrigado pela sua mensagem! Estou processando sua solicitação...'
      });
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Arquivo ${file.name} é muito grande. Máximo: 5MB`);
        return;
      }

      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];

      if (!validTypes.includes(file.type)) {
        alert(`Tipo de arquivo ${file.name} não suportado`);
        return;
      }

      addFile({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        type: file.type,
        size: file.size
      });
    });

    e.target.value = null;
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} />;
    return <FileText size={16} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (chatMode === 'whatsapp') {
    return null;
  }

  return (
    <div className="vingi-chat-input" data-testid="chat-input">
      {uploadedFiles.length > 0 && (
        <div className="vingi-chat-input__files">
          {uploadedFiles.map(file => (
            <div key={file.id} className="vingi-chat-input__file">
              <div className="vingi-chat-input__file-icon">
                {getFileIcon(file.type)}
              </div>
              <div className="vingi-chat-input__file-info">
                <span className="vingi-chat-input__file-name">{file.name}</span>
                <span className="vingi-chat-input__file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                className="vingi-chat-input__file-remove"
                onClick={() => removeFile(file.id)}
                title="Remover arquivo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="vingi-chat-input__container">
        <button
          className="vingi-chat-input__button"
          onClick={() => fileInputRef.current?.click()}
          title="Anexar arquivo"
          data-testid="attach-file-button"
        >
          <Paperclip size={20} />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />

        <textarea
          className="vingi-chat-input__textarea"
          placeholder="Digite sua mensagem..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isLoading}
          data-testid="message-input"
        />

        <button
          className="vingi-chat-input__send"
          onClick={handleSend}
          disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0)}
          title="Enviar mensagem"
          data-testid="send-message-button"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
