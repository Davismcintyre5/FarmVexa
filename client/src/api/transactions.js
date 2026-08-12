import api from './axios';

export const getTransactions = (farmId, params) => api.get(`/farm/transactions/farm/${farmId}`, { params });
export const getTransactionSummary = (farmId, period) => api.get(`/farm/transactions/farm/${farmId}/summary`, { params: { period } });
export const getTransaction = (id) => api.get(`/farm/transactions/${id}`);
export const addTransaction = (farmId, data) => api.post(`/farm/transactions/farm/${farmId}`, data);
export const updateTransaction = (id, data) => api.put(`/farm/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/farm/transactions/${id}`);