import api from './axios';

export const getInvoice = (invoiceNumber) => api.get(`/public/payment/invoice/${invoiceNumber}`);
export const stkInvoice = (data) => api.post('/public/payment/stk-invoice', data);
export const getMpesaStatus = (checkoutRequestId) => api.get(`/public/payment/mpesa-status/${checkoutRequestId}`);
export const getPaymentMethods = (params) => api.get('/public/payment/methods', { params });