import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { KnowledgeBase } from './KnowledgeBase';
import { SessionHistory } from './SessionHistory';
import { Analytics } from './Analytics';
import TicketsDashboard from './Tickets/TicketsDashboard';
import CustomersManager from './Customers/CustomersManager';
import AdvancedDashboard from './AdvancedDashboard';
import SettingsPanel from './Settings/SettingsPanel';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';
import { NotificationProvider } from '../../contexts/NotificationContext';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);

  // Atalho Ctrl+K para busca
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdvancedDashboard />;
      case 'tickets':
        return <TicketsDashboard />;
      case 'customers':
        return <CustomersManager />;
      case 'analytics':
        return <Analytics />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'history':
        return <SessionHistory />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <AdvancedDashboard />;
    }
  };

  return (
    <NotificationProvider>
      <AdminLayout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onSearchOpen={() => setShowSearch(true)}
      >
        {renderContent()}
      </AdminLayout>
      <NotificationCenter />
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </NotificationProvider>
  );
};
