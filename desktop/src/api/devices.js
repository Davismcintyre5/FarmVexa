import api from './axios';

export const getDevices = (farmId) => api.get(`/farm/devices/farm/${farmId}`);
export const getDevice = (id) => api.get(`/farm/devices/${id}`);
export const registerDevice = (farmId, data) => api.post(`/farm/devices/farm/${farmId}`, data);
export const updateDevice = (id, data) => api.put(`/farm/devices/${id}`, data);
export const deleteDevice = (id) => api.delete(`/farm/devices/${id}`);