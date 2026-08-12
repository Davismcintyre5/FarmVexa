import api from './axios';

export const getEquipment = (farmId, params) => api.get(`/farm/equipment/farm/${farmId}`, { params });
export const getEquipmentItem = (id) => api.get(`/farm/equipment/${id}`);
export const addEquipment = (farmId, data) => api.post(`/farm/equipment/farm/${farmId}`, data);
export const updateEquipment = (id, data) => api.put(`/farm/equipment/${id}`, data);
export const recordMaintenance = (id, data) => api.put(`/farm/equipment/${id}/maintenance`, data);
export const deleteEquipment = (id) => api.delete(`/farm/equipment/${id}`);