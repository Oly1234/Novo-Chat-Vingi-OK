import api from './api';

export const ticketAPI = {
  // Create
  async createTicket(ticketData) {
    const response = await api.post('/tickets/', ticketData);
    return response.data;
  },

  // Read
  async getTicket(ticketId) {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  },

  // List with filters
  async listTickets(filters = null, limit = 100) {
    const response = await api.post('/tickets/list', filters, {
      params: { limit },
      headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' }
    });
    return response.data;
  },

  // Update
  async updateTicket(ticketId, updateData, usuario = 'Admin') {
    const response = await api.put(`/tickets/${ticketId}`, updateData, {
      params: { usuario },
      headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' }
    });
    return response.data;
  },

  // Delete
  async deleteTicket(ticketId) {
    const response = await api.delete(`/tickets/${ticketId}`, {
      headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' }
    });
    return response.data;
  },

  // Add comment
  async addComment(ticketId, texto, interno = false, usuario = 'Admin') {
    const response = await api.post('/tickets/comment', 
      { ticketId, texto, interno },
      {
        params: { usuario },
        headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' }
      }
    );
    return response.data;
  },

  // Upload attachment
  async uploadAttachment(ticketId, file, usuario = 'Admin') {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/tickets/${ticketId}/attachment`,
      formData,
      {
        params: { usuario },
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-password': localStorage.getItem('adminPassword') || ''
        }
      }
    );
    return response.data;
  },

  // Add rating
  async addRating(ticketId, nota, comentario = null, usuario = 'Cliente') {
    const response = await api.post(
      `/tickets/${ticketId}/rating`,
      { nota, comentario },
      { params: { usuario } }
    );
    return response.data;
  },

  // Get stats
  async getStats() {
    const response = await api.get('/tickets/stats/overview', {
      headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' }
    });
    return response.data;
  },

  // Export CSV
  async exportCSV() {
    const response = await api.get('/tickets/export/csv', {
      headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' },
      responseType: 'blob'
    });
    
    // Download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Bulk actions
  async bulkAssign(ticketIds, responsavel) {
    const response = await api.post('/tickets/bulk/assign',
      { ticket_ids: ticketIds, responsavel },
      { headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' } }
    );
    return response.data;
  },

  async bulkChangeStatus(ticketIds, status) {
    const response = await api.post('/tickets/bulk/status',
      { ticket_ids: ticketIds, status },
      { headers: { 'x-admin-password': localStorage.getItem('adminPassword') || '' } }
    );
    return response.data;
  }
};

export default ticketAPI;
