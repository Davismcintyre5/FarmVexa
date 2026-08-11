import api from './axios';

export const getFields = (farmId) => api.get(`/farm/fields/farm/${farmId}`);
export const getField = (id) => api.get(`/farm/fields/${id}`);
export const createField = (farmId, data) => api.post(`/farm/fields/farm/${farmId}`, data);
export const updateField = (id, data) => api.put(`/farm/fields/${id}`, data);
export const deleteField = (id) => api.delete(`/farm/fields/${id}`);