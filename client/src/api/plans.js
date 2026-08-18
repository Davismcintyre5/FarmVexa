import api from './axios';

export const getPlans = () => api.get('/farm/plans');
export const submitUpgrade = (data) => api.post('/farm/plans/upgrade', data);