/**
 * Sistema de Cache Busting e Atualização Automática
 */

const APP_VERSION = '1.0.8'; // Incrementar a cada deploy

export const initCacheControl = () => {
  // Verificar versão e limpar cache se necessário
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion !== APP_VERSION) {
    console.log(`🔄 Nova versão detectada: ${APP_VERSION} (anterior: ${storedVersion})`);
    
    // Limpar localStorage seletivamente (manter dados importantes)
    const keysToKeep = ['adminPassword', 'adminUserName', 'theme'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar caches do Service Worker
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Atualizar versão
    localStorage.setItem('app_version', APP_VERSION);
    
    // Force reload uma vez
    if (!sessionStorage.getItem('reloaded_for_version')) {
      sessionStorage.setItem('reloaded_for_version', APP_VERSION);
      window.location.reload(true);
    }
  }
};

export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  }
};

// Verificar atualizações a cada 5 minutos
export const startUpdateChecker = () => {
  setInterval(checkForUpdates, 5 * 60 * 1000);
};

export const forceReload = () => {
  // Limpar cache e recarregar
  if ('caches' in window) {
    caches.keys().then(names => {
      Promise.all(names.map(name => caches.delete(name)))
        .then(() => {
          window.location.reload(true);
        });
    });
  } else {
    window.location.reload(true);
  }
};
