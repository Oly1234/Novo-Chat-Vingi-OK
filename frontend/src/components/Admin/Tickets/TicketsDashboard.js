import React, { useState, useEffect } from 'react';
import { 
  Ticket, Plus, Filter, Download, Search, 
  Clock, AlertCircle, CheckCircle, XCircle,
  MoreVertical, Eye, Edit, Trash
} from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import { ticketAPI } from '../../../services/ticketAPI';
import TicketModal from '../modals/TicketModal';
import './TicketsDashboard.css';

const TicketsDashboard = ({ adminUser }) => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        ticketAPI.listTickets({}),
        ticketAPI.getStats()
      ]);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setStats(statsData || {});
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      setTickets([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (formData) => {
    try {
      await ticketAPI.createTicket({
        ...formData,
        criadoPor: adminUser || 'Admin'
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      alert('Erro ao criar chamado');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      novo: { color: 'success', text: 'Novo' },
      em_andamento: { color: 'warning', text: 'Em Andamento' },
      aguardando: { color: 'info', text: 'Aguardando' },
      resolvido: { color: 'default', text: 'Resolvido' },
      fechado: { color: 'dark', text: 'Fechado' }
    };
    return badges[status] || badges.novo;
  };

  const getPriorityBadge = (prioridade) => {
    const badges = {
      baixa: { color: 'default', text: 'Baixa' },
      normal: { color: 'info', text: 'Normal' },
      alta: { color: 'warning', text: 'Alta' },
      urgente: { color: 'danger', text: 'Urgente' }
    };
    return badges[prioridade] || badges.normal;
  };

  const filteredTickets = Array.isArray(tickets) ? tickets.filter(ticket =>
    ticket.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.numero?.toString().includes(searchTerm)
  ) : [];

  if (loading && !stats) {
    return (
      <div className="tickets-loading">
        <div className="loading-spinner" />
        <p>Carregando chamados...</p>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Chamados</h1>
          <p className="page-subtitle">Gerencie todas as solicitações de suporte</p>
        </div>
        <Button icon={<Plus size={20} />} onClick={() => setShowModal(true)}>
          Novo Chamado
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <StatCard
            title="Total de Tickets"
            value={stats.total || 0}
            icon={<Ticket size={24} />}
            color="primary"
          />
          <StatCard
            title="Novos"
            value={stats.novos || 0}
            icon={<Clock size={24} />}
            color="success"
            change={12}
          />
          <StatCard
            title="Em Andamento"
            value={stats.emAndamento || 0}
            icon={<AlertCircle size={24} />}
            color="warning"
          />
          <StatCard
            title="Vencidos"
            value={stats.vencidos || 0}
            icon={<XCircle size={24} />}
            color="danger"
            change={-8}
          />
          <StatCard
            title="Resolvidos Hoje"
            value={stats.resolvidos || 0}
            icon={<CheckCircle size={24} />}
            color="success"
            change={15}
          />
        </div>
      )}

      {/* Toolbar */}
      <Card padding="none">
        <div className="tickets-toolbar">
          <div className="search-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por título, número ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" icon={<Filter size={18} />} size="medium">
              Filtros
            </Button>
            <Button variant="secondary" icon={<Download size={18} />} size="medium">
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      <Card 
        title="Lista de Chamados"
        subtitle={`${filteredTickets.length} chamado(s) encontrado(s)`}
        padding="none"
      >
        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <Ticket size={48} />
            <h3>Nenhum chamado encontrado</h3>
            <p>Crie um novo chamado ou ajuste os filtros de busca</p>
          </div>
        ) : (
          <div className="tickets-table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Departamento</th>
                  <th>Criado em</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => {
                  const status = getStatusBadge(ticket.status);
                  const priority = getPriorityBadge(ticket.prioridade);
                  
                  return (
                    <tr key={ticket.id}>
                      <td className="ticket-number">#{ticket.numero}</td>
                      <td>
                        <div className="ticket-info">
                          <div className="ticket-title">{ticket.titulo}</div>
                          <div className="ticket-requester">{ticket.solicitante?.nome || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge--${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${priority.color}`}>
                          {priority.text}
                        </span>
                      </td>
                      <td>{ticket.departamento || 'Suporte'}</td>
                      <td>
                        {new Date(ticket.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <button className="action-btn" title="Visualizar">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn" title="Editar">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn action-btn--danger" title="Excluir">
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TicketsDashboard;
