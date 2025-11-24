import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import './NotificationContext.css';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCenter, setShowCenter] = useState(false);

  useEffect(() => {
    // Carregar notificações do localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }

    // Polling para novas notificações (simular real-time)
    const interval = setInterval(checkNewNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkNewNotifications = async () => {
    try {
      const password = localStorage.getItem('adminPassword');
      if (!password) return;

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications`, {
        headers: { 'X-Admin-Password': password }
      });
      
      if (response.ok) {
        const newNotifs = await response.json();
        if (newNotifs.length > 0) {
          addNotifications(newNotifs);
        }
      }
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now(),
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(prev => prev + 1);

    // Tocar som se habilitado
    const soundEnabled = localStorage.getItem('notification-sound') !== 'false';
    if (soundEnabled) {
      playNotificationSound();
    }
  };

  const addNotifications = (notifs) => {
    const newNotifs = notifs.map(n => ({
      id: Date.now() + Math.random(),
      ...n,
      read: false,
      timestamp: new Date().toISOString()
    }));

    setNotifications(prev => {
      const updated = [...newNotifs, ...prev].slice(0, 50);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });

    setUnreadCount(prev => prev + newNotifs.length);
  };

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGWi77OifTRAMUKHj79+nVRQKRZ/g8r5sIQUrgs7y2Yk2BxlouvLpn00QDVGh4+/fp1UUCkWf4PK+bCAFK4LO8tmJNgcZaLvy6Z9NEA1RoeTv36dVFApFn+Dyvmwg');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const value = {
    notifications,
    unreadCount,
    showCenter,
    setShowCenter,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};