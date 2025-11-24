import React, { useRef } from 'react';
import { Paperclip, Loader } from 'lucide-react';
import './FileUploadButton.css';

const FileUploadButton = ({ onFileSelect, disabled, isUploading }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 5MB');
        return;
      }

      // Validar tipo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Use PDF, DOC, DOCX ou imagens.');
        return;
      }

      onFileSelect(file);
    }
    
    // Limpar input
    e.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        className="file-upload-btn"
        onClick={handleClick}
        disabled={disabled || isUploading}
        title="Anexar arquivo"
      >
        {isUploading ? (
          <Loader size={20} className="spin" />
        ) : (
          <Paperclip size={20} />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
      />
    </>
  );
};

export default FileUploadButton;
