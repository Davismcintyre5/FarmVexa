import api from './axios';

export const getFieldReadings = (fieldId, limit = 50) => 
    api.get(`/farm/sensors/field/${fieldId}?limit=${limit}`);
export const getDeviceReadings = (deviceId, limit = 50) => 
    api.get(`/farm/sensors/device/${deviceId}?limit=${limit}`);