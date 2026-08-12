import api from './axios';

export const getReport = (farmId, params) => api.get(`/farm/reports/farm/${farmId}`, { params });