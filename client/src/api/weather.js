import api from './axios';

export const getFarmWeather = (farmId) => api.get(`/farm/weather/farm/${farmId}`);
export const refreshWeather = (farmId) => api.post(`/farm/weather/farm/${farmId}/refresh`);