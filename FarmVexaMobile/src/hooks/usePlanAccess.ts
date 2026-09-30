import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { authApi, publicApi } from '../api/axios';

/**
 * Runtime plan feature gating.
 * 
 * Priority:
 * 1. /farm/auth/me → data.plan.features (from server, authoritative)
 * 2. /admin/public/settings → paymentModels[].features (fallback)
 * 3. Hardcoded fallback map (last resort only)
 */

type FeatureKey =
  | 'crop_scan'
  | 'field_scan'
  | 'field_scan_manual'
  | 'livestock'
  | 'health'
  | 'production'
  | 'inventory'
  | 'finance'
  | 'weather'
  | 'ai_chat'
  | 'team'
  | 'market'
  | 'reports'
  | 'alerts'
  | 'iot_field_sensors'
  | 'storage_monitoring'
  | 'co2_detection'
  | 'pir_detection';

// Last-resort fallback — only used if both server calls fail
const FALLBACK_FEATURES: Record<string, FeatureKey[]> = {
  'Basic': [
    'crop_scan',
    'field_scan_manual',
    'livestock',
    'health',
    'production',
    'inventory',
    'finance',
    'weather',
    'ai_chat',
    'team',
    'market',
    'reports',
    'alerts',
  ],
  'Basic Monthly': [
    'crop_scan',
    'field_scan_manual',
    'livestock',
    'health',
    'production',
    'inventory',
    'finance',
    'weather',
    'ai_chat',
    'team',
    'market',
    'reports',
    'alerts',
  ],
  'Pro': [
    'crop_scan',
    'field_scan',
    'field_scan_manual',
    'livestock',
    'health',
    'production',
    'inventory',
    'finance',
    'weather',
    'ai_chat',
    'team',
    'market',
    'reports',
    'alerts',
    'iot_field_sensors',
  ],
  'Full Suite': [
    'crop_scan',
    'field_scan',
    'field_scan_manual',
    'livestock',
    'health',
    'production',
    'inventory',
    'finance',
    'weather',
    'ai_chat',
    'team',
    'market',
    'reports',
    'alerts',
    'iot_field_sensors',
    'storage_monitoring',
    'co2_detection',
    'pir_detection',
  ],
};

export function usePlanAccess(feature: FeatureKey | string) {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState(user?.selectedPlan || 'Basic');

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      setLoading(true);
      try {
        // Attempt 1: server authoritative — /farm/auth/me
        try {
          const res = await authApi.me();
          const plan = res.data?.data?.plan;
          const features = plan?.features || [];
          const currentPlanName = plan?.name || res.data?.data?.user?.selectedPlan || 'Basic';

          if (mounted) {
            setAllowed(features.includes(feature));
            setPlanName(currentPlanName);
            setLoading(false);
          }
          return;
        } catch {
          // Fall through to fallback
        }

        // Attempt 2: /admin/public/settings → paymentModels
        try {
          const res = await publicApi.getPublicSettings();
          const models = res.data?.data?.paymentModels || [];
          const currentPlanName = user?.selectedPlan || 'Basic';
          const model = models.find((m: any) => m.name === currentPlanName);
          const features = model?.features || [];

          if (mounted) {
            setAllowed(features.includes(feature));
            setPlanName(currentPlanName);
            setLoading(false);
          }
          return;
        } catch {
          // Fall through to hardcoded
        }

        // Attempt 3: hardcoded fallback (both server calls failed)
        const currentPlanName = user?.selectedPlan || 'Basic';
        const fallback = FALLBACK_FEATURES[currentPlanName] || FALLBACK_FEATURES['Basic'];

        if (mounted) {
          setAllowed(fallback.includes(feature as FeatureKey));
          setPlanName(currentPlanName);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [feature, user?.selectedPlan]);

  return { allowed, loading, planName };
}