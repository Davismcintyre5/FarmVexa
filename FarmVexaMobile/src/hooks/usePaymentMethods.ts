import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../api/axios';
import { PaymentMethod } from '../types';

interface UsePaymentMethodsOptions {
  amount?: number;
  currency?: string;
  invoiceNumber?: string;
}

interface UsePaymentMethodsResult {
  methods: PaymentMethod[];
  stkMethod: PaymentMethod | null;
  manualMethods: PaymentMethod[];
  settings: any;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Fetches enabled payment methods + public settings.
 * Optionally fetches amount-specific instructions when amount or invoiceNumber is provided.
 */
export function usePaymentMethods(options: UsePaymentMethodsOptions = {}): UsePaymentMethodsResult {
  const { amount, currency = 'KES', invoiceNumber } = options;

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt 1: fetch public settings (always works)
      const settingsRes = await publicApi.getPublicSettings();
      const settingsData = settingsRes.data?.data || {};
      setSettings(settingsData);

      // Attempt 2: if amount or invoiceNumber provided, use the dedicated methods endpoint
      if (amount !== undefined || invoiceNumber) {
        try {
          const methodsRes = await publicApi.getPaymentMethods({
            amount,
            currency,
            invoiceNumber,
          });
          const methodsData = methodsRes.data?.data?.methods || methodsRes.data?.methods || [];
          setMethods(methodsData);
        } catch {
          // Fallback to settings.paymentMethods
          setMethods(settingsData.paymentMethods || []);
        }
      } else {
        setMethods(settingsData.paymentMethods || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payment methods');
      setMethods([]);
      setSettings({});
    } finally {
      setLoading(false);
    }
  }, [amount, currency, invoiceNumber]);

  useEffect(() => {
    load();
  }, [load]);

  const stkMethod = methods.find((m) => m.code === 'mpesa_stk' || m.action?.type === 'stk') || null;
  const manualMethods = methods.filter((m) => m !== stkMethod);

  return {
    methods,
    stkMethod,
    manualMethods,
    settings,
    loading,
    error,
    reload: load,
  };
}