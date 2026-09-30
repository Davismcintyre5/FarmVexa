import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getPaymentMethods } from '../api/invoices';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const usePaymentMethods = ({ amount, invoiceNumber, currency } = {}) => {
    const [methods, setMethods] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const settingsRes = await axios.get(`${API_BASE}/admin/public/settings`);
            const data = settingsRes.data.data || {};
            setSettings(data);

            let list = data.paymentMethods || [];

            if (amount || invoiceNumber) {
                try {
                    const res = await getPaymentMethods({
                        amount,
                        currency,
                        invoiceNumber,
                    });
                    const serverMethods = res.data.data?.methods || res.data.methods;
                    if (Array.isArray(serverMethods) && serverMethods.length > 0) {
                        list = serverMethods;
                    }
                } catch {}
            }

            setMethods(list);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [amount, invoiceNumber, currency]);

    useEffect(() => { load(); }, [load]);

    const stkMethod = methods.find((m) => m.code === 'mpesa_stk') || null;
    const manualMethods = methods.filter((m) => m.code !== 'mpesa_stk');

    return {
        methods,
        stkMethod,
        manualMethods,
        settings,
        loading,
        error,
        reload: load,
    };
};