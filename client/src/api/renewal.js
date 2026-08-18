import api from './axios';

export const getSubscriptionDetails = () => api.get('/farm/renewal/subscription');
export const submitRenewal = (data) => api.post('/farm/renewal/submit', data);