import api from './axios';

export const getInventory = (farmId, params) => api.get(`/farm/inventory/farm/${farmId}`, { params });
export const getInventoryItem = (id) => api.get(`/farm/inventory/${id}`);
export const addInventoryItem = (farmId, data) => api.post(`/farm/inventory/farm/${farmId}`, data);
export const updateInventoryItem = (id, data) => api.put(`/farm/inventory/${id}`, data);
export const stockIn = (id, quantity) => api.put(`/farm/inventory/${id}/stock-in`, { quantity });
export const stockOut = (id, quantity, reason, details) => api.put(`/farm/inventory/${id}/stock-out`, { quantity, reason, details });
export const deleteInventoryItem = (id) => api.delete(`/farm/inventory/${id}`);