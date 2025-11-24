import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import './CustomerModal.css';

const CustomerModal = ({ isOpen, onClose, onSubmit, customer }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    status: 'ativo',
    segment: 'textil',
    notes: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        status: 'ativo',
        segment: 'textil',
        notes: ''
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="customer-modal-overlay" onClick={onClose}>
      <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="customer-modal-header">
          <div className="header-left">
            <div className="header-icon">
              <User size={24} />
            </div>
            <div>
              <h2>{customer ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <p>{customer ? 'Atualizar informações do cliente' : 'Adicionar novo cliente ao sistema'}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="customer-modal-form">
          <div className="form-section">
            <h3>Informações Básicas</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div className="form-group">
                <label>Empresa</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Endereço</h3>
            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Cidade - Estado"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Classificação</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="form-group">
                <label>Segmento</label>
                <select
                  value={formData.segment}
                  onChange={(e) => handleChange('segment', e.target.value)}
                >
                  <option value="textil">Têxtil</option>
                  <option value="confeccao">Confecção</option>
                  <option value="varejo">Varejo</option>
                  <option value="industria">Indústria</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Observações</h3>
            <div className="form-group">
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Anotações adicionais sobre o cliente..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {customer ? 'Atualizar' : 'Adicionar'} Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
