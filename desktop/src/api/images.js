import api from './axios';

export const uploadImage = (formData) => 
    api.post('/farm/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
export const getFieldImages = (fieldId) => api.get(`/farm/images/field/${fieldId}`);
export const getImage = (id) => api.get(`/farm/images/${id}`);
export const deleteImage = (id) => api.delete(`/farm/images/${id}`);