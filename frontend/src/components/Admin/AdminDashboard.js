import React, { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, Settings, Database, Users, TrendingUp, Bell, LogOut, ArrowLeft } from 'lucide-react';
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
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/stats`, {
        headers: { 'X-Admin-Password': localStorage.getItem('adminPassword') }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const tabs = [
    { id: 'tickets', label: 'Chamados', icon: <Bell size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
    { id: 'stats', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'queue', label: 'Fila', icon: <Users size={20} /> },
    { id: 'knowledge', label: 'Base de Conhecimento', icon: <Database size={20} /> },
    { id: 'history', label: 'Histórico', icon: <MessageSquare size={20} /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <Settings size={20} /> }
  ];

  const handleBackToChat = () => {
    window.location.href = '/';
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <img src="/logo.png" alt="Vingi" className="admin-header__logo" />
          <h1>Admin</h1>
        </div>

        <nav className="admin-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav__item ${activeTab === tab.id ? 'admin-nav__item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-footer">
          <button className="admin-footer__button" onClick={handleBackToChat}>
            <ArrowLeft size={18} />
            <span>Voltar ao Chat</span>
          </button>
          <button className="admin-footer__button" onClick={onLogout}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>

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
