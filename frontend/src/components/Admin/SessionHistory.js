import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Clock, User, Calendar, Eye, Download,
  Search, Filter, ChevronRight, Star
} from 'lucide-react';
import Card from './shared/Card';
import Button from './shared/Button';
import Pagination from '../shared/Pagination';
import './SessionHistory.css';

export const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/sessions`, {
        headers: { 'X-Admin-Password': password }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = Array.isArray(sessions) ? sessions.filter(session =>
    session.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.sessionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.department?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  const getDepartmentBadge = (dept) => {
    const badges = {
      VENDAS: { color: '#6366f1', icon: '💰' },
      SUPORTE: { color: '#8b5cf6', icon: '🔧' },
      RH: { color: '#ec4899', icon: '👔' },
      AMOSTRAS: { color: '#f59e0b', icon: '📦' },
      TRIAGEM: { color: '#10b981', icon: '👋' }
    };
    return badges[dept] || { color: '#94a3b8', icon: '💬' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageCount = (session) => {
    return session.messages?.length || 0;
  };

  const getSessionDuration = (session) => {
    if (!session.startTime || !session.endTime) return 'Em andamento';
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const diff = Math.floor((end - start) / 1000 / 60);
    return `${diff}min`;
  };

  if (loading) {
    return (
      <div className="session-history-loading">
        <div className="loading-spinner" />
        <p>Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="session-history-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Histórico de Sessões</h1>
          <p className="page-subtitle">Visualize todas as conversas e interações</p>
        </div>
        <Button variant="secondary" icon={<Download size={18} />}>
          Exportar Histórico
        </Button>
      </div>

      {/* Stats */}
      <div className="session-stats-grid">
        <Card padding="default" className="stat-card-mini">
          <div className="stat-mini-content">
            <MessageSquare size={32} className="stat-icon" />
            <div className="stat-mini-info">
              <div className="stat-mini-value">{sessions.length}</div>
              <div className="stat-mini-label">Total de Sessões</div>
            </div>
          </div>
        </Card>
        
        <Card padding="default" className="stat-card-mini">
          <div className="stat-mini-content">
            <Clock size={32} className="stat-icon" />
            <div className="stat-mini-info">
              <div className="stat-mini-value">
                {sessions.filter(s => s.status === 'active').length}
              </div>
              <div className="stat-mini-label">Sessões Ativas</div>
            </div>
          </div>
        </Card>
        
        <Card padding="default" className="stat-card-mini">
          <div className="stat-mini-content">
            <User size={32} className="stat-icon" />
            <div className="stat-mini-info">
              <div className="stat-mini-value">
                {new Set(sessions.map(s => s.userId)).size}
              </div>
              <div className="stat-mini-label">Usuários Únicos</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card padding="none">
        <div className="session-toolbar">
          <div className="search-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por ID, usuário ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" icon={<Filter size={18} />} size="medium">
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Sessions List */}
      <Card padding="none">
        {paginatedSessions.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>Nenhuma sessão encontrada</h3>
            <p>As conversas aparecerão aqui assim que iniciarem</p>
          </div>
        ) : (
          <div className="sessions-list">
            {paginatedSessions.map(session => {
              const deptBadge = getDepartmentBadge(session.department);
              
              return (
                <div 
                  key={session.sessionId} 
                  className="session-item"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="session-icon" style={{ background: deptBadge.color }}>
                    {deptBadge.icon}
                  </div>
                  
                  <div className="session-content">
                    <div className="session-header-row">
                      <div className="session-id">
                        Sessão #{session.sessionId?.slice(0, 8)}
                      </div>
                      <div className="session-date">
                        <Calendar size={14} />
                        {formatDate(session.startTime)}
                      </div>
                    </div>
                    
                    <div className="session-info-row">
                      <div className="session-user">
                        <User size={14} />
                        {session.userId || 'Anônimo'}
                      </div>
                      {session.department && (
                        <span 
                          className="session-department-badge"
                          style={{ background: deptBadge.color }}
                        >
                          {session.department}
                        </span>
                      )}
                    </div>
                    
                    <div className="session-metrics">
                      <div className="session-metric">
                        <MessageSquare size={14} />
                        <span>{getMessageCount(session)} mensagens</span>
                      </div>
                      <div className="session-metric">
                        <Clock size={14} />
                        <span>{getSessionDuration(session)}</span>
                      </div>
                      {session.rating && (
                        <div className="session-metric">
                          <Star size={14} fill="currentColor" />
                          <span>{session.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button className="session-action-btn">
                    <ChevronRight size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredSessions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            totalItems={filteredSessions.length}
          />
        )}
      </Card>

      {/* Session Detail Modal */}
      {selectedSession && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedSession(null)} />
          <div className="session-detail-modal">
            <div className="modal-header">
              <h2>Detalhes da Sessão</h2>
              <button className="modal-close" onClick={() => setSelectedSession(null)}>×</button>
            </div>
            
            <div className="modal-body session-detail-body">
              <div className="session-detail-info">
                <div className="detail-row">
                  <strong>ID da Sessão:</strong>
                  <span>{selectedSession.sessionId}</span>
                </div>
                <div className="detail-row">
                  <strong>Usuário:</strong>
                  <span>{selectedSession.userId}</span>
                </div>
                <div className="detail-row">
                  <strong>Departamento:</strong>
                  <span>{selectedSession.department || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <strong>Início:</strong>
                  <span>{formatDate(selectedSession.startTime)}</span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${selectedSession.status}`}>
                    {selectedSession.status}
                  </span>
                </div>
              </div>

              <div className="session-messages">
                <h3>Mensagens ({getMessageCount(selectedSession)})</h3>
                <div className="messages-container">
                  {selectedSession.messages?.map((msg, index) => (
                    <div key={index} className={`message-bubble message-${msg.sender}`}>
                      <div className="message-sender">{msg.sender === 'user' ? 'Usuário' : 'Assistente'}</div>
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">
                        {msg.timestamp ? formatDate(msg.timestamp) : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
