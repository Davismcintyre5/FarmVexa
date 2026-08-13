import api from './axios';

export const getMarketStatus = () => api.get('/farm/market/status');
export const getMyProducts = (params) => api.get('/farm/market/products', { params });
export const getMyProduct = (id) => api.get(`/farm/market/products/${id}`);
export const addProduct = (data) => api.post('/farm/market/products', data);
export const updateProduct = (id, data) => api.put(`/farm/market/products/${id}`, data);
export const updateProductStatus = (id, status) => api.put(`/farm/market/products/${id}/status`, { status });
export const deleteProduct = (id) => api.delete(`/farm/market/products/${id}`);
export const getMyInquiries = (params) => api.get('/farm/market/inquiries', { params });
export const markInquiryRead = (id) => api.put(`/farm/market/inquiries/${id}/read`);
export const deleteInquiry = (id) => api.delete(`/farm/market/inquiries/${id}`);
export const uploadMarketImage = (formData) =>
    api.post('/farm/market/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });