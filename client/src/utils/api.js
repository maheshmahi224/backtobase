import axios from 'axios';
import { API_URL } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Event API
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getStats: (id) => api.get(`/events/${id}/stats`),
  uploadICS: (id, data) => api.post(`/events/${id}/upload-ics`, data),
  downloadICS: (id) => `${API_URL}/events/${id}/download-ics`,
};

// Participant API
export const participantAPI = {
  upload: (eventId, csvData) => api.post(`/participants/upload/${eventId}`, { csvData }),
  getByEvent: (eventId, params) => api.get(`/participants/event/${eventId}`, { params }),
  getOne: (id) => api.get(`/participants/${id}`),
  update: (id, data) => api.put(`/participants/${id}`, data),
  delete: (id) => api.delete(`/participants/${id}`),
  bulkUpdate: (data) => api.post('/participants/bulk-update', data),
  addManual: (data) => api.post('/participants/manual', data),
};

// Email API
export const emailAPI = {
  sendInvitations: (data) => api.post('/email/send-invitations', data),
  sendConfirmations: (data) => api.post('/email/send-confirmations', data),
  test: (data) => api.post('/email/test', data),
};

// Check-in API
export const checkinAPI = {
  verify: (token) => api.get(`/checkin/${token}`),
  checkIn: (token) => api.post(`/checkin/${token}`),
  manual: (data) => api.post('/checkin/manual', data),
  getStats: (eventId) => api.get(`/checkin/stats/${eventId}`),
};

// Shortlist API
export const shortlistAPI = {
  getShortlisted: (eventId, params) => api.get(`/shortlist/${eventId}`, { params }),
  add: (participantIds) => api.post('/shortlist/add', { participantIds }),
  remove: (participantIds) => api.post('/shortlist/remove', { participantIds }),
};

// Template API
export const templateAPI = {
  getByEvent: (eventId) => api.get(`/templates/${eventId}`),
  getOne: (templateId) => api.get(`/templates/single/${templateId}`),
  create: (data) => api.post('/templates', data),
  update: (templateId, data) => api.put(`/templates/${templateId}`, data),
  delete: (templateId) => api.delete(`/templates/${templateId}`),
  getDefaults: (eventId) => api.get(`/templates/defaults/${eventId}`),
};

// QR Code API
export const qrAPI = {
  verify: (qrData) => api.post('/qr/verify', { qrData }),
  scan: (qrData) => api.post('/qr/scan', { qrData }),
  generate: (participantId) => api.get(`/qr/generate/${participantId}`),
  getAttended: (eventId, params) => api.get(`/qr/attended/${eventId}`, { params }),
  getStats: (eventId) => api.get(`/qr/stats/${eventId}`),
};

export default api;
