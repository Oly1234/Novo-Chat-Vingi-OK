import React, { useState, useRef } from 'react';
import { Send, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import VoiceInput from '../shared/VoiceInput';
import FileUploadButton from '../shared/FileUploadButton';
import './ChatInput.css';

export const ChatInput = () => {
  const { sendMessage, uploadedFiles, addFile, removeFile, isLoading, chatMode, uploadFile, sessionId } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    if (isLoading) return;

    const text = inputValue.trim();
    const attachments = uploadedFiles.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      url: f.url || URL.createObjectURL(f.file)
    }));

    setInputValue('');
    
    // Send message with attachments
    await sendMessage(text, attachments);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    
    try {
      // Upload para o backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        
        addFile({
          id: Date.now() + Math.random(),
          file,
          name: uploadedFile.filename,
          type: uploadedFile.contentType,
          size: uploadedFile.size,
          url: uploadedFile.url
        });
      } else {
        alert(`Falha ao fazer upload de ${file.name}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setIsUploading(false);
    }
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

        <VoiceInput
          onTranscript={(text) => setInputValue(prev => prev + (prev ? ' ' : '') + text)}
          disabled={isLoading}
        />

        <textarea
          className="vingi-chat-input__textarea"
          placeholder="Digite ou use o microfone..."
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
