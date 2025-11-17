import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const chatAPI = {
  // Start a new session
  startSession: async (userId = null) => {
    const response = await api.post('/chat/start', { userId });
    return response.data;
  },

  // Send a message
  sendMessage: async (sessionId, text, attachments = []) => {
    const response = await api.post('/chat/message', {
      sessionId,
      text,
      attachments
    });
    return response.data;
  },

  // Upload a file
  uploadFile: async (sessionId, file) => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('file', file);

    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Request human handoff
  requestHandoff: async (sessionId, reason = null) => {
    const response = await api.post('/chat/handoff', {
      sessionId,
      reason
    });
    return response.data;
  },

  // Get WhatsApp URL
  getWhatsAppURL: async (sessionId, department) => {
    const response = await api.post('/chat/whatsapp', {
      sessionId,
      department
    });
    return response.data;
  },

  // Get session
  getSession: async (sessionId) => {
    const response = await api.get(`/chat/session/${sessionId}`);
    return response.data;
  }
};

export const configAPI = {
  // Get WhatsApp configuration
  getWhatsAppConfig: async () => {
    const response = await api.get('/config/whatsapp');
    return response.data;
  },

  // Update WhatsApp configuration (admin only)
  updateWhatsAppConfig: async (departments, adminPassword) => {
    const response = await api.post('/config/whatsapp', 
      { departments },
      {
        headers: {
          'X-Admin-Password': adminPassword
        }
      }
    );
    return response.data;
  }
};

export default api;
