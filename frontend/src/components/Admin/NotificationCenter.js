import React from 'react';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { 
    notifications, 
    showCenter, 
    setShowCenter, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();

  const getNotificationIcon = (type) => {
    const icons = {
      ticket: '🎫',
      message: '💬',
      alert: '⚠️',
      success: '✅',
      info: 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return 'Agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  if (!showCenter) return null;

  return (
    <>
      <div className="notification-overlay" onClick={() => setShowCenter(false)} />
      <div className="notification-center">
        <div className="notification-header">
          <div className="notification-title">
            <Bell size={20} />
            <h3>Notificações</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="unread-badge">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <div className="notification-actions">
            <button 
              className="notification-btn" 
              onClick={markAllAsRead}
              title="Marcar todas como lidas"
            >
              <Check size={18} />
            </button>
            <button 
              className="notification-btn" 
              onClick={clearAll}
              title="Limpar todas"
            >
              <Trash2 size={18} />
            </button>
            <button 
              className="notification-btn" 
              onClick={() => setShowCenter(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell size={48} />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-text">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                  </div>
                  <div className="notification-time">
                    {getTimeAgo(notification.timestamp)}
                  </div>
                </div>
                {!notification.read && <div className="notification-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;