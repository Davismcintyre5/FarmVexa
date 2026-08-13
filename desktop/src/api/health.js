import api from './axios';

export const getHealthRecords = (farmId, params) => api.get(`/farm/health/farm/${farmId}`, { params });
export const getHealthRecord = (id) => api.get(`/farm/health/${id}`);
export const addHealthRecord = (farmId, data) => api.post(`/farm/health/farm/${farmId}`, data);
export const updateHealthRecord = (id, data) => api.put(`/farm/health/${id}`, data);
export const deleteHealthRecord = (id) => api.delete(`/farm/health/${id}`);
export const getUpcomingVaccinations = (farmId) => api.get(`/farm/health/farm/${farmId}/vaccinations/upcoming`);
export const getOverdueVaccinations = (farmId) => api.get(`/farm/health/farm/${farmId}/vaccinations/overdue`);