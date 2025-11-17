import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="vingi-modal-overlay" onClick={onClose}>
      <div 
        className={`vingi-modal vingi-modal--${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vingi-modal__header">
          <h2 className="vingi-modal__title">{title}</h2>
          <button className="vingi-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="vingi-modal__body">
          {children}
        </div>
      </div>
    </div>
  );
};
