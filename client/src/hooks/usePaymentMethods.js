import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

let cachedSettings = null;

export default function usePaymentMethods({ amount, currency = 'KES', invoiceNumber } = {}) {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/public/settings');
            const all = res.data?.data?.paymentMethods || [];

            if (amount || invoiceNumber) {
                try {
                    const fresh = await api.get('/public/payment/methods', {
                        params: { amount, currency, invoiceNumber },
                    });
                    const freshList = fresh.data?.data?.methods || [];
                    if (freshList.length > 0) {
                        setMethods(freshList);
                        return;
                    }
                } catch {
                    // fall through to the settings-derived list
                }
            }

            setMethods(all);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payment methods');
            setMethods([]);
        } finally {
            setLoading(false);
        }
    }, [amount, currency, invoiceNumber]);

    useEffect(() => {
        load();
    }, [load]);

    const stkMethod = methods.find((m) => m.code === 'mpesa_stk' && m.mode === 'auto');
    const manualMethods = methods.filter((m) => m.code !== 'mpesa_stk');

    return {
        methods,
        stkMethod,
        manualMethods,
        loading,
        error,
        reload: load,
    };
}