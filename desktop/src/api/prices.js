import api from './axios';

export const getPrices = (farmId, params) => api.get(`/farm/prices/farm/${farmId}`, { params });
export const getPrice = (id) => api.get(`/farm/prices/${id}`);
export const setPrice = (farmId, data) => api.post(`/farm/prices/farm/${farmId}`, data);
export const updatePrice = (id, data) => api.put(`/farm/prices/${id}`, data);
export const deletePrice = (id) => api.delete(`/farm/prices/${id}`);
export const getSuggestedProducts = (farmId) => api.get(`/farm/prices/farm/${farmId}/suggested`);