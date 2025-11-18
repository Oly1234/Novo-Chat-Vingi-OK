import React, { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, Settings, Database, Users, TrendingUp, Bell, LogOut } from 'lucide-react';
import { KnowledgeBase } from './KnowledgeBase';
import { QueueManagement } from './QueueManagement';
import { Statistics } from './Statistics';
import { WhatsAppConfig } from './WhatsAppConfig';
import { SessionHistory } from './SessionHistory';
import { Analytics } from './Analytics';
import './AdminDashboard.css';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'X-Admin-Password': localStorage.getItem('adminPassword')
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
    { id: 'stats', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'queue', label: 'Fila', icon: <Users size={20} /> },
    { id: 'knowledge', label: 'Base de Conhecimento', icon: <Database size={20} /> },
    { id: 'history', label: 'Histórico', icon: <MessageSquare size={20} /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Settings size={20} /> }
  ];

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header__left">
          <img src="/logo.png" alt="Vingi" className="admin-header__logo" />
          <div>
            <h1 className="admin-header__title">Painel Administrativo</h1>
            <p className="admin-header__subtitle">Vingi Têxtil - Sistema de Atendimento</p>
          </div>
        </div>
        <div className="admin-header__right">
          {stats && (
            <div className="admin-header__stats">
              <div className="admin-header__stat">
                <TrendingUp size={16} />
                <span>{stats.activeSessions} Ativos</span>
              </div>
              <div className="admin-header__stat admin-header__stat--warning">
                <Bell size={16} />
                <span>{stats.waitingQueue} na Fila</span>
              </div>
            </div>
          )}
          <button className="admin-header__logout" onClick={onLogout}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-nav__tab ${activeTab === tab.id ? 'admin-nav__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`admin-tab-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'stats' && <Statistics stats={stats} />}
        {activeTab === 'queue' && <QueueManagement />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'history' && <SessionHistory />}
        {activeTab === 'whatsapp' && <WhatsAppConfig />}
      </div>
    </div>
  );
};
