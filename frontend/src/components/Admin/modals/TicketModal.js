import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import './TicketModal.css';

const TicketModal = ({ isOpen, onClose, onSubmit, ticket }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'normal',
    categoria: 'suporte',
    solicitante: '',
    email: ''
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        titulo: ticket.titulo || '',
        descricao: ticket.descricao || '',
        prioridade: ticket.prioridade || 'normal',
        categoria: ticket.categoria || 'suporte',
        solicitante: ticket.solicitante || '',
        email: ticket.email || ''
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        prioridade: 'normal',
        categoria: 'suporte',
        solicitante: '',
        email: ''
      });
    }
  }, [ticket, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      titulo: '',
      descricao: '',
      prioridade: 'normal',
      categoria: 'suporte',
      solicitante: '',
      email: ''
    });
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-modal-header">
          <div>
            <h2>{ticket ? 'Editar Chamado' : 'Novo Chamado'}</h2>
            <p>{ticket ? 'Atualizar informações do chamado' : 'Criar uma nova solicitação de suporte'}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ticket-modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Solicitante *</label>
              <input
                type="text"
                value={formData.solicitante}
                onChange={(e) => handleChange('solicitante', e.target.value)}
                placeholder="Nome do solicitante"
                required
              />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Descreva o problema resumidamente"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva o problema com detalhes..."
              rows={5}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prioridade</label>
              <select
                value={formData.prioridade}
                onChange={(e) => handleChange('prioridade', e.target.value)}
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
              >
                <option value="suporte">Suporte Técnico</option>
                <option value="duvida">Dúvida</option>
                <option value="requisicao">Requisição</option>
                <option value="problema">Problema</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {ticket ? 'Atualizar' : 'Criar'} Chamado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
