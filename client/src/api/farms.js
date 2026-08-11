import api from './axios';

export const getFarms = () => api.get('/farm/farms');
export const getFarm = (id) => api.get(`/farm/farms/${id}`);
export const createFarm = (data) => api.post('/farm/farms', data);
export const updateFarm = (id, data) => api.put(`/farm/farms/${id}`, data);
export const deleteFarm = (id) => api.delete(`/farm/farms/${id}`);