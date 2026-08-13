import api from './axios';

export const login = (data) => api.post('/farm/auth/login', data);
export const register = (data) => api.post('/farm/auth/register', data);
export const getProfile = () => api.get('/farm/auth/profile');
export const updateProfile = (data) => api.put('/farm/auth/profile', data);
export const changePassword = (data) => api.put('/farm/auth/change-password', data);
export const forgotPassword = (email) => api.post('/farm/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/farm/auth/reset-password', data);