// API configuration
const API_BASE_URL = window.location.origin + '/api';

// API client helper
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient(API_BASE_URL);

// Guest API
const guestAPI = {
  getAll: (filters = {}) => api.get('/guests', filters),
  getById: (id) => api.get(`/guests/${id}`),
  getStats: () => api.get('/guests/stats'),
  create: (guestData) => api.post('/guests', guestData),
  update: (id, guestData) => api.patch(`/guests/${id}`, guestData),
  delete: (id) => api.delete(`/guests/${id}`)
};

// Attendance API
const attendanceAPI = {
  getAll: (filters = {}) => api.get('/attendance', filters),
  getSummary: () => api.get('/attendance/summary'),
  create: (attendanceData) => api.post('/attendance', attendanceData),
  updateStatus: (id, status) => api.patch(`/attendance/${id}/status`, { status })
};

// Thank You Template API
const thankYouAPI = {
  getAll: () => api.get('/thank-you'),
  getById: (id) => api.get(`/thank-you/${id}`),
  create: (templateData) => api.post('/thank-you', templateData),
  update: (id, templateData) => api.patch(`/thank-you/${id}`, templateData),
  delete: (id) => api.delete(`/thank-you/${id}`),
  toggle: (id, isEnabled) => api.patch(`/thank-you/${id}/toggle`, { is_enabled: isEnabled }),
  preview: (messageTemplate, sampleData) => api.post('/thank-you/preview', { 
    message_template: messageTemplate, 
    sample_data: sampleData 
  })
};

// WhatsApp API
const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  getQRCode: () => api.get('/whatsapp/qr'),
  initialize: () => api.post('/whatsapp/initialize'),
  sendToGuest: (guestId, data) => api.post(`/whatsapp/send/${guestId}`, data),
  sendToAll: (data) => api.post('/whatsapp/send-all', data),
  disconnect: () => api.post('/whatsapp/disconnect')
};

export { guestAPI, attendanceAPI, thankYouAPI, whatsappAPI };
