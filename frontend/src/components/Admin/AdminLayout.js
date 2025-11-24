import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bell, TrendingUp, Database, MessageSquare, 
  Users, Settings, LogOut, Menu, X, Sun, Moon, ChevronRight,
  Search, ChevronDown
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('admin-theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    // Aplicar tema
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
    
    // Auto-fechar sidebar no mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    window.location.href = '/';
  };

  const navItems = [
    { id: 'tickets', label: 'Chamados', icon: Bell, badge: 3 },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'knowledge', label: 'Base de Conhecimento', icon: Database },
    { id: 'history', label: 'Histórico', icon: MessageSquare },
    { id: 'whatsapp', label: 'WhatsApp', icon: Settings }
  ];

  return (
    <div className="admin-layout">
      {/* Overlay para mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">V</div>
            {sidebarOpen && (
              <div className="logo-text">
                <h1>Vingi Têxtil</h1>
                <span>Admin Panel</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
              >
                <Icon size={20} className="nav-icon" />
                {sidebarOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    <ChevronRight size={16} className="nav-arrow" />
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {sidebarOpen && <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>}
          </button>
          
          {sidebarOpen && (
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">A</div>
                <div className="user-info">
                  <span className="user-name">Administrador</span>
                  <span className="user-role">Super Admin</span>
                </div>
                <ChevronDown size={16} />
              </button>
              
              {userMenuOpen && (
                <div className="user-menu-dropdown">
                  <button onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="main-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="header-search">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Buscar..." 
            />
          </div>

          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">5</span>
            </button>
          </div>
        </div>

        <div className="main-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
