import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatContainer } from './components/Chat/ChatContainer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { ChatProvider } from './contexts/ChatContext';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check auth
    const password = localStorage.getItem('adminPassword');
    setIsAuthenticated(!!password);

    // Check theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Cache busting: Force reload se houver nova versão
    const APP_VERSION = '1.0.8';
    const currentVersion = localStorage.getItem('app_version');
    
    if (currentVersion !== APP_VERSION) {
      console.log('Nova versão detectada, limpando cache...');
      localStorage.setItem('app_version', APP_VERSION);
      
      // Limpar caches antigos
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (!name.includes(APP_VERSION)) {
              caches.delete(name);
            }
          });
        });
      }
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ChatProvider>
      <Router>
        <div className="App" data-theme={theme}>
          <Routes>
            <Route path="/" element={<ChatContainer theme={theme} toggleTheme={toggleTheme} />} />
            <Route 
              path="/admin" 
              element={
                isAuthenticated ? (
                  <AdminDashboard onLogout={handleLogout} />
                ) : (
                  <AdminLogin onLogin={handleLogin} />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ChatProvider>
  );
}

export default App;
