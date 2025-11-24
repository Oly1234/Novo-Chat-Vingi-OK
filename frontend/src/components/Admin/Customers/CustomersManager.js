import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Download, Mail, Phone, 
  Calendar, Tag, Edit, Trash, Eye, MoreVertical,
  Building, MapPin, FileText
} from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import StatCard from '../shared/StatCard';
import CustomerModal from '../modals/CustomerModal';
import './CustomersManager.css';

const CustomersManager = ({ adminUser }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, vip: 0 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/customers`, {
        headers: { 'X-Admin-Password': password }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setStats(data.stats || { total: 0, active: 0, inactive: 0, vip: 0 });
      } else {
        setCustomers([]);
        setStats({ total: 0, active: 0, inactive: 0, vip: 0 });
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
      setStats({ total: 0, active: 0, inactive: 0, vip: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    
    try {
      const password = localStorage.getItem('adminPassword');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': password }
      });
      
      if (response.ok) {
        await loadCustomers();
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && customer.status === 'active';
    if (filter === 'inactive') return matchesSearch && customer.status === 'inactive';
    if (filter === 'vip') return matchesSearch && customer.tags?.includes('VIP');
    return matchesSearch;
  });

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Gerencie sua base de clientes e histórico de interações</p>
        </div>
        <Button icon={<Plus size={20} />} onClick={handleAddCustomer}>
          Novo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total de Clientes"
          value={stats.total}
          icon={<Users size={24} />}
          color="primary"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.active}
          icon={<Users size={24} />}
          color="success"
          change={8}
        />
        <StatCard
          title="Clientes Inativos"
          value={stats.inactive}
          icon={<Users size={24} />}
          color="default"
        />
        <StatCard
          title="Clientes VIP"
          value={stats.vip}
          icon={<Users size={24} />}
          color="warning"
        />
      </div>

      {/* Filters */}
      <Card padding="none">
        <div className="customers-toolbar">
          <div className="search-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos
            </button>
            <button 
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Ativos
            </button>
            <button 
              className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inativos
            </button>
            <button 
              className={`filter-tab ${filter === 'vip' ? 'active' : ''}`}
              onClick={() => setFilter('vip')}
            >
              VIP
            </button>
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" icon={<Download size={18} />} size="medium">
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Customer Cards */}
      <div className="customers-grid">
        {loading ? (
          <div className="customers-loading">
            <div className="loading-spinner" />
            <p>Carregando clientes...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>Nenhum cliente encontrado</h3>
            <p>Adicione clientes para começar a gerenciar sua base</p>
            <Button icon={<Plus size={18} />} onClick={handleAddCustomer}>
              Adicionar Primeiro Cliente
            </Button>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <Card key={customer.id} className="customer-card" padding="default">
              <div className="customer-card-header">
                <div className="customer-avatar">
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div className="customer-info">
                  <h3 className="customer-name">{customer.name}</h3>
                  {customer.company && (
                    <div className="customer-company">
                      <Building size={14} />
                      {customer.company}
                    </div>
                  )}
                </div>
                <div className="customer-actions">
                  <button className="action-btn" onClick={() => handleEditCustomer(customer)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn action-btn--danger" onClick={() => handleDeleteCustomer(customer.id)}>
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              
              <div className="customer-card-body">
                <div className="customer-contact">
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{customer.email || 'N/A'}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{customer.phone || 'N/A'}</span>
                  </div>
                  {customer.city && (
                    <div className="contact-item">
                      <MapPin size={16} />
                      <span>{customer.city}</span>
                    </div>
                  )}
                </div>
                
                {customer.tags && customer.tags.length > 0 && (
                  <div className="customer-tags">
                    {customer.tags.map((tag, index) => (
                      <span key={index} className="customer-tag">{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="customer-stats">
                  <div className="stat-item">
                    <FileText size={16} />
                    <span>{customer.ticketsCount || 0} tickets</span>
                  </div>
                  <div className="stat-item">
                    <Calendar size={16} />
                    <span>Cliente desde {new Date(customer.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadCustomers();
          }}
        />
      )}
    </div>
  );
};

// Modal Component
const CustomerModal = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState(customer || {
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    tags: [],
    notes: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const password = localStorage.getItem('adminPassword');
      const url = customer
        ? `${process.env.REACT_APP_BACKEND_URL}/api/customers/${customer.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/customers`;
      
      const response = await fetch(url, {
        method: customer ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-header">
          <h2>{customer ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Empresa</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Cidade</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Notas Internas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {customer ? 'Salvar Alterações' : 'Adicionar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CustomersManager;