import api from './axios';

export const getFarmAlerts = (farmId) => api.get(`/farm/alerts/farm/${farmId}`);
export const markAlertRead = (id) => api.put(`/farm/alerts/${id}/read`);