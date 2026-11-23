import api from './api';

export const noticeService = {
  getNotices: async (params = {}) => {
    const response = await api.get('/notices', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/notices', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/notices/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  },
};
