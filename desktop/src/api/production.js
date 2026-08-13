import api from './axios';

export const getProductionRecords = (farmId, params) => api.get(`/farm/production/farm/${farmId}`, { params });
export const getProductionSummary = (farmId, period) => api.get(`/farm/production/farm/${farmId}/summary`, { params: { period } });
export const getProductionRecord = (id) => api.get(`/farm/production/${id}`);
export const addProductionRecord = (farmId, data) => api.post(`/farm/production/farm/${farmId}`, data);
export const updateProductionRecord = (id, data) => api.put(`/farm/production/${id}`, data);
export const deleteProductionRecord = (id) => api.delete(`/farm/production/${id}`);