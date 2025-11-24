import React from 'react';
import { X, User, Calendar, Tag, AlertCircle } from 'lucide-react';
import './TicketViewModal.css';

const TicketViewModal = ({ isOpen, onClose, ticket }) => {
  if (!isOpen || !ticket) return null;

  const getStatusColor = (status) => {
    const colors = {
      novo: '#10b981',
      em_andamento: '#f59e0b',
      aguardando: '#3b82f6',
      resolvido: '#6b7280',
      fechado: '#374151'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      baixa: '#6b7280',
      normal: '#3b82f6',
      alta: '#f59e0b',
      urgente: '#ef4444'
    };
    return colors[priority] || '#6b7280';
  };

  return (
    <div className="ticket-view-overlay" onClick={onClose}>
      <div className="ticket-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-view-header">
          <div>
            <h2>Chamado #{ticket.numero}</h2>
            <p>{ticket.titulo}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="ticket-view-body">
          <div className="ticket-view-badges">
            <span 
              className="badge badge-status" 
              style={{ background: getStatusColor(ticket.status) }}
            >
              {ticket.status?.replace('_', ' ').toUpperCase()}
            </span>
            <span 
              className="badge badge-priority"
              style={{ background: getPriorityColor(ticket.prioridade) }}
            >
              {ticket.prioridade?.toUpperCase()}
            </span>
            {ticket.categoria && (
              <span className="badge badge-category">
                {ticket.categoria}
              </span>
            )}
          </div>

          <div className="ticket-view-section">
            <h3>Descrição</h3>
            <p className="ticket-description">{ticket.descricao}</p>
          </div>

          <div className="ticket-view-info-grid">
            <div className="info-item">
              <User size={18} />
              <div>
                <label>Solicitante</label>
                <p>{ticket.solicitante || 'Não informado'}</p>
              </div>
            </div>

            <div className="info-item">
              <Calendar size={18} />
              <div>
                <label>Criado em</label>
                <p>{new Date(ticket.criadoEm).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {ticket.email && (
              <div className="info-item">
                <Tag size={18} />
                <div>
                  <label>E-mail</label>
                  <p>{ticket.email}</p>
                </div>
              </div>
            )}

            {ticket.criadoPor && (
              <div className="info-item">
                <User size={18} />
                <div>
                  <label>Criado por</label>
                  <p>{ticket.criadoPor}</p>
                </div>
              </div>
            )}
          </div>

          {ticket.comentarios && ticket.comentarios.length > 0 && (
            <div className="ticket-view-section">
              <h3>Comentários</h3>
              <div className="comments-list">
                {ticket.comentarios.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-header">
                      <strong>{comment.autor}</strong>
                      <span>{new Date(comment.criadoEm).toLocaleString('pt-BR')}</span>
                    </div>
                    <p>{comment.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ticket-view-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketViewModal;
