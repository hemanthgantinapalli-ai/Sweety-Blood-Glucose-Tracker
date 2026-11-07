import api from './api';

export const reportService = {
  // Get Daily report
  getDailyReport: async (date) => {
    const response = await api.get('/reports/daily', { params: { date } });
    return response.data;
  },

  // Get Month-to-date report
  getMonthToDateReport: async (date) => {
    const response = await api.get('/reports/month-to-date', { params: { date } });
    return response.data;
  },

  // Get Previous month report
  getPreviousMonthReport: async (date) => {
    const response = await api.get('/reports/previous-month', { params: { date } });
    return response.data;
  },
};
