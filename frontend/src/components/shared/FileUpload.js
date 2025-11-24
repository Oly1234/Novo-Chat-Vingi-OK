import React, { useRef, useState } from 'react';
import { Upload, X, File, Image, FileText, Video, Music } from 'lucide-react';
import './FileUpload.css';

const FileUpload = ({ onFilesSelected, maxFiles = 5, maxSize = 10, accept }) => {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        alert(`Arquivo ${file.name} é muito grande. Máximo: ${maxSize}MB`);
        return false;
      }
      return true;
    });

    const totalFiles = files.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitido`);
      return;
    }

    const filesWithPreview = validFiles.map(file => ({
      file,
      id: Math.random().toString(36),
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    const updatedFiles = [...files, ...filesWithPreview];
    setFiles(updatedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map(f => f.file));
    }
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    if (onFilesSelected) {
      onFilesSelected(updatedFiles.map(f => f.file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image size={24} />;
    if (type.startsWith('video/')) return <Video size={24} />;
    if (type.startsWith('audio/')) return <Music size={24} />;
    if (type.includes('pdf')) return <FileText size={24} />;
    return <File size={24} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-dropzone ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={48} />
        <p className="upload-text">Arraste arquivos aqui ou clique para selecionar</p>
        <p className="upload-hint">Máximo: {maxFiles} arquivos, {maxSize}MB cada</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="file-upload-list">
          {files.map(fileObj => (
            <div key={fileObj.id} className="file-upload-item">
              {fileObj.type.startsWith('image/') ? (
                <img src={fileObj.preview} alt={fileObj.name} className="file-preview-img" />
              ) : (
                <div className="file-preview-icon">
                  {getFileIcon(fileObj.type)}
                </div>
              )}
              <div className="file-info">
                <div className="file-name">{fileObj.name}</div>
                <div className="file-size">{formatFileSize(fileObj.size)}</div>
              </div>
              <button
                className="file-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(fileObj.id);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;