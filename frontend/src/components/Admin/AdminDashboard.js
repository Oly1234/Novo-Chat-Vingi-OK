import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { KnowledgeBase } from './KnowledgeBase';
import { QueueManagement } from './QueueManagement';
import { Statistics } from './Statistics';
import { WhatsAppConfig } from './WhatsAppConfig';
import { SessionHistory } from './SessionHistory';
import { Analytics } from './Analytics';
import TicketsDashboard from './Tickets/TicketsDashboard';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('tickets');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'tickets':
        return <TicketsDashboard />;
      case 'analytics':
        return <Analytics />;
      case 'dashboard':
        return <Statistics stats={stats} />;
      case 'queue':
        return <QueueManagement />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'history':
        return <SessionHistory />;
      case 'whatsapp':
        return <WhatsAppConfig />;
      default:
        return <TicketsDashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};
