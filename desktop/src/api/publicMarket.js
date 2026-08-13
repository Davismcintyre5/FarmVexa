import api from './axios';

export const getPublicMarketStatus = () => api.get('/public/market/status');
export const getPublicProducts = (params) => api.get('/public/market/products', { params });
export const getPublicProduct = (id) => api.get(`/public/market/products/${id}`);
export const sendInquiry = (id, data) => api.post(`/public/market/products/${id}/inquire`, data);