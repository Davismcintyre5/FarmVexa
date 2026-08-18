import { useAuth } from '../context/AuthContext';

const planFeatures = {
    'Basic': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
    'Basic Monthly': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
    'Pro': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps'],
    'Full Suite': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps', 'storage_monitoring', 'co2_detection', 'pir_detection'],
};

export const usePlanAccess = (feature) => {
    const { user } = useAuth();
    const plan = user?.selectedPlan || 'Basic';
    const allowedFeatures = planFeatures[plan] || planFeatures['Basic'];
    return allowedFeatures.includes(feature);
};

export const PlanBanner = ({ feature }) => {
    const { user } = useAuth();
    const plan = user?.selectedPlan || 'Basic';
    const hasAccess = usePlanAccess(feature);

    if (hasAccess) return null;

    return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700 mb-6">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                        Your plan ({plan}) does not include this feature.
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Upgrade to Pro or Full Suite to access.
                    </p>
                    <Link to="/plans" className="inline-block mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700">
                        Upgrade Plan
                    </Link>
                </div>
            </div>
        </div>
    );
};