import api from './api';

export const attendanceService = {
  getAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  recordAttendance: async (data) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },

  recordBulk: async (data) => {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },

  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  getStats: async (studentId) => {
    const response = await api.get(`/attendance/stats/${studentId}`);
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get('/attendance/student/me');
    return response.data;
  },
};
