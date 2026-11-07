import api from './api';

export const readingService = {
  // Get all readings with optional filters
  getReadings: async (params = {}) => {
    const response = await api.get('/readings', { params });
    return response.data;
  },

  // Get reading by ID
  getReadingById: async (id) => {
    const response = await api.get(`/readings/${id}`);
    return response.data;
  },

  // Create new reading
  createReading: async (data) => {
    const response = await api.post('/readings', data);
    return response.data;
  },

  // Update reading
  updateReading: async (id, data) => {
    const response = await api.put(`/readings/${id}`, data);
    return response.data;
  },

  // Delete reading
  deleteReading: async (id) => {
    const response = await api.delete(`/readings/${id}`);
    return response.data;
  },
};
