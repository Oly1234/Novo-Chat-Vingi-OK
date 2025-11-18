import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import './FileUploadModal.css';

export const FileUploadModal = ({ isOpen, onClose, onUpload, candidateData }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);
    setSuccess(false);

    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Apenas arquivos PDF, DOC ou DOCX são permitidos');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecione um arquivo primeiro');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onUpload(file);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="file-upload-modal" onClick={onClose}>
      <div className="file-upload-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="file-upload-modal__header">
          <h3>Enviar Currículo</h3>
          <button onClick={onClose} className="file-upload-modal__close">
            <X size={20} />
          </button>
        </div>

        <div className="file-upload-modal__body">
          {candidateData && (
            <div className="file-upload-modal__info">
              <p><strong>Nome:</strong> {candidateData.name}</p>
              <p><strong>WhatsApp:</strong> {candidateData.phone}</p>
              {candidateData.email && <p><strong>Email:</strong> {candidateData.email}</p>}
            </div>
          )}

          <div className="file-upload-modal__dropzone" onClick={() => fileInputRef.current?.click()}>
            {!file ? (
              <>
                <Upload size={48} />
                <p>Clique para selecionar ou arraste seu currículo aqui</p>
                <span>PDF, DOC ou DOCX - Máx. 10MB</span>
              </>
            ) : (
              <div className="file-upload-modal__file-info">
                <FileText size={48} />
                <p>{file.name}</p>
                <span>{formatFileSize(file.size)}</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {error && (
            <div className="file-upload-modal__error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="file-upload-modal__success">
              <CheckCircle size={16} />
              Currículo enviado com sucesso!
            </div>
          )}
        </div>

        <div className="file-upload-modal__footer">
          <button onClick={onClose} className="file-upload-modal__button file-upload-modal__button--secondary">
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading || success}
            className="file-upload-modal__button file-upload-modal__button--primary"
          >
            {uploading ? 'Enviando...' : success ? 'Enviado!' : 'Enviar Currículo'}
          </button>
        </div>
      </div>
    </div>
  );
};
