import React, { useState, useEffect } from 'react';
import { 
  Ticket, Plus, Filter, Download, Search, 
  Clock, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';
import { ticketAPI } from '../../../services/ticketAPI';
import { useAutoSave } from '../../../hooks/useAutoSave';
import './TicketsDashboard.css';

const TicketsDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save de rascunhos
  const drafts = JSON.parse(localStorage.getItem('ticket_drafts') || '{}');
  useAutoSave(
    async (data) => {
      localStorage.setItem('ticket_drafts', JSON.stringify(data));
    },
    drafts,
    { 
      interval: 120000, // 2 min
      enabled: true,
      onSave: (date) => setLastSaved(date)
    }
  );

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        ticketAPI.listTickets(filters),
        ticketAPI.getStats()
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      novo: '#28a745',
      em_andamento: '#ffc107',
      aguardando: '#17a2b8',
      resolvido: '#6c757d',
      fechado: '#343a40'
    };
    return colors[status] || '#6c757d';
  };

  const getSLAColor = (sla) => {
    if (sla.vencido) return '#dc3545';
    if (sla.percentualUsado > 80) return '#ffc107';
    return '#28a745';
  };

  const getPriorityBadge = (prioridade) => {
    const badges = {
      baixa: { color: '#6c757d', text: 'Baixa' },
      normal: { color: '#17a2b8', text: 'Normal' },
      alta: { color: '#ffc107', text: 'Alta' },
      urgente: { color: '#dc3545', text: 'Urgente' }
    };
    return badges[prioridade] || badges.normal;
  };

  const handleExportCSV = async () => {
    try {
      await ticketAPI.exportCSV();
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar tickets');
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.numero.toString().includes(searchTerm)
  );

  if (loading && !stats) {
    return <div className="tickets-loading">Carregando tickets...</div>;
  }

  return (
    <div className="tickets-dashboard">
      {/* Header */}
      <div className="tickets-header">
        <div>
          <h1><Ticket size={32} /> Sistema de Chamados</h1>
          <p className="tickets-subtitle">Gerencie todas as solicitações de suporte</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = '#/admin/tickets/novo'}>
          <Plus size={20} /> Novo Chamado
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="tickets-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
              <Ticket size={24} color="#0066CC" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total de Tickets</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
              <Clock size={24} color="#28a745" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.novos}</div>
              <div className="stat-label">Novos</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
              <AlertCircle size={24} color="#ffc107" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.emAndamento}</div>
              <div className="stat-label">Em Andamento</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fce4ec' }}>
              <XCircle size={24} color="#dc3545" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.vencidos}</div>
              <div className="stat-label">Vencidos</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
              <CheckCircle size={24} color="#9c27b0" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.resolvidos}</div>
              <div className="stat-label">Resolvidos</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="tickets-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por título, descrição ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={() => {}}>
            <Filter size={20} /> Filtros
          </button>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={20} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="autosave-indicator">
          ✓ Salvo automaticamente às {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Tickets List */}
      <div className="tickets-list">
        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <Ticket size={48} color="#ccc" />
            <p>Nenhum ticket encontrado</p>
          </div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Título</th>
                <th width="120">Status</th>
                <th width="100">Prioridade</th>
                <th width="150">Departamento</th>
                <th width="120">SLA</th>
                <th width="150">Criado em</th>
                <th width="100">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => {
                const priority = getPriorityBadge(ticket.prioridade);
                return (
                  <tr key={ticket.id} onClick={() => window.location.href = `#/admin/tickets/${ticket.id}`}>
                    <td><strong>#{ticket.numero}</strong></td>
                    <td>
                      <div className="ticket-title">{ticket.titulo}</div>
                      <div className="ticket-subtitle">{ticket.solicitante.nome}</div>
                    </td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge" 
                        style={{ backgroundColor: priority.color }}
                      >
                        {priority.text}
                      </span>
                    </td>
                    <td>{ticket.departamento}</td>
                    <td>
                      <div className="sla-indicator">
                        <div 
                          className="sla-bar" 
                          style={{ 
                            width: `${Math.min(100, ticket.sla.percentualUsado)}%`,
                            backgroundColor: getSLAColor(ticket.sla)
                          }}
                        />
                        <span className="sla-text">
                          {ticket.sla.vencido ? 'Vencido' : `${Math.floor(ticket.sla.tempoRestante / 60)}h`}
                        </span>
                      </div>
                    </td>
                    <td>{new Date(ticket.criadoEm).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-sm">Ver</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TicketsDashboard;
