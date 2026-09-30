import { useEffect, useState } from 'react';
import api from '../api/axios';

let cachedPlans = null;

const FALLBACK_FEATURES = {
    'Basic': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
    'Basic Monthly': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
    'Pro': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps'],
    'Full Suite': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps', 'storage_monitoring', 'co2_detection', 'pir_detection'],
};

export default function usePlanAccess(feature) {
    const [allowed, setAllowed] = useState(true);
    const [loading, setLoading] = useState(true);
    const [planName, setPlanName] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const check = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                if (token) {
                    try {
                        const me = await api.get('/farm/auth/me');
                        const selectedPlan = me.data?.data?.user?.selectedPlan;
                        const featuresFromMe = me.data?.data?.plan?.features;

                        if (!cancelled && featuresFromMe?.length) {
                            setPlanName(selectedPlan || 'Basic');
                            setAllowed(featuresFromMe.includes(feature));
                            setLoading(false);
                            return;
                        }
                    } catch {
                        // fall through to cached plan lookup
                    }
                }

                if (!cachedPlans) {
                    const res = await api.get('/admin/public/settings');
                    cachedPlans = res.data?.data?.paymentModels || [];
                }

                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const currentPlan = user.selectedPlan || 'Basic';
                const planDoc = cachedPlans.find((p) => p.name === currentPlan);
                const features = planDoc?.features?.length
                    ? planDoc.features
                    : FALLBACK_FEATURES[currentPlan] || FALLBACK_FEATURES['Basic'];

                if (!cancelled) {
                    setPlanName(currentPlan);
                    setAllowed(features.includes(feature));
                }
            } catch {
                if (!cancelled) setAllowed(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        check();
        return () => { cancelled = true; };
    }, [feature]);

    return { allowed, loading, planName };
}