import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const fallbackFeatures = {
    'Basic': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
    'Basic Monthly': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
    'Pro': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps'],
    'Full Suite': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps', 'storage_monitoring', 'co2_detection', 'pir_detection'],
};

export const usePlanAccess = (feature) => {
    const { user } = useAuth();
    const [allowed, setAllowed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [planName, setPlanName] = useState(user?.selectedPlan || 'Basic');

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            try {
                const res = await api.get('/farm/auth/me');
                const data = res.data.data;
                const features = data.plan?.features || data.user?.plan?.features;
                const plan = data.plan?.name || data.user?.selectedPlan || 'Basic';
                if (!cancelled) {
                    setPlanName(plan);
                    if (Array.isArray(features) && features.length > 0) {
                        setAllowed(features.includes(feature));
                        setLoading(false);
                        return;
                    }
                }
            } catch {}

            try {
                const res = await api.get('/admin/public/settings');
                const models = res.data.data?.paymentModels || [];
                const current = models.find((m) => m.name === (user?.selectedPlan || 'Basic'));
                if (!cancelled && current?.features) {
                    setAllowed(current.features.includes(feature));
                    setLoading(false);
                    return;
                }
            } catch {}

            if (!cancelled) {
                const plan = user?.selectedPlan || 'Basic';
                const list = fallbackFeatures[plan] || fallbackFeatures['Basic'];
                setPlanName(plan);
                setAllowed(list.includes(feature));
                setLoading(false);
            }
        };

        check();
        return () => { cancelled = true; };
    }, [feature, user]);

    return { allowed, loading, planName };
};