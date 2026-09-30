import api from './axios';

export const getInvoiceByNumber = (invoiceNumber) =>
    api.get(`/public/payment/invoice/${invoiceNumber}`);

export const payWithStk = (invoiceNumber, phone) =>
    api.post('/public/payment/stk-invoice', { invoiceNumber, phone });

export const pollStkStatus = (checkoutRequestId) =>
    api.get(`/public/payment/mpesa-status/${checkoutRequestId}`);

export const getPublicPaymentMethods = (params) =>
    api.get('/public/payment/methods', { params });