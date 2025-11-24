import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import './AdminAuthModal.css';

const AdminAuthModal = ({ onAuthenticated }) => {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar se já tem nome salvo
    const savedName = localStorage.getItem('adminUserName');
    if (!savedName) {
      setShow(true);
    } else {
      onAuthenticated(savedName);
    }
  }, [onAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('adminUserName', name.trim());
      setShow(false);
      onAuthenticated(name.trim());
    }
  };

  if (!show) return null;

  return (
    <div className="admin-auth-overlay">
      <div className="admin-auth-modal">
        <div className="modal-header">
          <div className="modal-icon">
            <User size={40} />
          </div>
          <h2>Bem-vindo ao Admin</h2>
          <p>Para melhor rastreabilidade, por favor identifique-se</p>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="adminName">Seu Nome</label>
            <input
              id="adminName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              autoFocus
              required
            />
          </div>
          
          <button type="submit" className="btn-submit" disabled={!name.trim()}>
            Continuar
          </button>
          
          <p className="modal-note">
            💡 Seu nome será usado para registrar todas as ações no sistema
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthModal;
