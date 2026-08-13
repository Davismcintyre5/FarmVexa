import api from './axios';

export const getStock = (farmId) => api.get(`/farm/stock/farm/${farmId}`);
export const getStockItem = (id) => api.get(`/farm/stock/${id}`);
export const getStockMovements = (id) => api.get(`/farm/stock/${id}/movements`);
export const stockIn = (farmId, data) => api.post(`/farm/stock/farm/${farmId}/in`, data);
export const stockOut = (farmId, data) => api.post(`/farm/stock/farm/${farmId}/out`, data);
export const updateStock = (id, data) => api.put(`/farm/stock/${id}`, data);
export const deleteStock = (id) => api.delete(`/farm/stock/${id}`);