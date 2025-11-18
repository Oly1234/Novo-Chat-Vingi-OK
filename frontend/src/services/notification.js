// Notification Service
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [200, 100, 200],
        tag: 'vingi-notification',
        renotify: true,
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async showNewMessageNotification(message) {
    await this.showNotification('Nova mensagem - Vingi Têxtil', {
      body: message,
      icon: '/logo.png'
    });
  }

  async showQueueUpdateNotification(position) {
    await this.showNotification('Atualização da Fila', {
      body: `Você está em ${position}º na fila de atendimento`,
      icon: '/logo.png'
    });
  }

  async showAgentConnectedNotification() {
    await this.showNotification('Atendente Conectado', {
      body: 'Um atendente está pronto para conversar com você!',
      icon: '/logo.png'
    });
  }
}

export const notificationService = new NotificationService();
