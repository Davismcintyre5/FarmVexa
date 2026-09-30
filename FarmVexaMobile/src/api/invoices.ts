import api from './axios';

/**
 * Wraps the public payment API.
 * All endpoints are unauthenticated (public).
 */

export interface PaymentInstruction {
  code: 'mpesa_stk' | 'mpesa_send_money' | 'mpesa_till' | 'mpesa_paybill' | 'bank' | 'cash' | 'stripe';
  title: string;
  description: string;
  steps: string[];
  recipient: {
    phone?: string;
    tillNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
    branch?: string;
    swift?: string;
  };
  action?: {
    type: 'stk' | 'stripe';
    label: string;
  };
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  total: number;
  currency: string;
  dueDate?: string;
  paidAt?: string;
  status: 'unpaid' | 'paid' | 'failed' | 'pending_verification' | 'cancelled';
  paymentMethod?: string;
  paymentRef?: string;
  paymentInstructions?: PaymentInstruction[];
  invoiceUrl?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal?: number;
  discount?: number;
  tax?: number;
}

/**
 * GET /api/public/payment/invoice/:invoiceNumber
 * Returns the invoice + payment instructions. No auth required.
 */
export const getInvoice = async (invoiceNumber: string): Promise<Invoice> => {
  const res = await api.get(`/public/payment/invoice/${invoiceNumber}`);
  return res.data?.data?.invoice || res.data?.invoice;
};

/**
 * POST /api/public/payment/stk-invoice
 * Body: { invoiceNumber, phone }
 * Returns: { checkoutRequestId, message }
 */
export const payWithStk = async (
  invoiceNumber: string,
  phone: string
): Promise<{ checkoutRequestId: string; message: string }> => {
  const res = await api.post('/public/payment/stk-invoice', {
    invoiceNumber,
    phone,
  });
  return res.data?.data || res.data;
};

/**
 * GET /api/public/payment/mpesa-status/:checkoutRequestId
 * Returns current STK status + invoice status.
 */
export const checkMpesaStatus = async (
  checkoutRequestId: string
): Promise<{
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  invoiceStatus: string;
  amountPaid: number;
  amountDue: number;
  currency: string;
  receipt?: string;
}> => {
  const res = await api.get(
    `/public/payment/mpesa-status/${checkoutRequestId}`
  );
  return res.data?.data || res.data;
};

/**
 * GET /api/public/payment/methods
 * Returns enabled payment methods + amount-specific instructions.
 */
export const getPaymentMethods = async (params?: {
  amount?: number;
  currency?: string;
  invoiceNumber?: string;
}): Promise<{ methods: any[] }> => {
  const res = await api.get('/public/payment/methods', { params });
  return res.data?.data || res.data;
};