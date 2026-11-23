import api from './api';

export const resultService = {
  getResults: async (params = {}) => {
    const response = await api.get('/results', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/results/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/results', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/results/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/results/${id}`);
    return response.data;
  },

  getStudentResults: async (studentId) => {
    const response = await api.get(`/results/student/${studentId}`);
    return response.data;
  },

  getMyResults: async () => {
    const response = await api.get('/results/student/me');
    return response.data;
  },
};
