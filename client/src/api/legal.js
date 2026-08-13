import api from './axios';

export const getLegal = (type) => api.get(`/public/legal/${type}`);