import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function PlanGate({ feature, planName, title, description, ctaLabel }) {
    return (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700 text-center">
            <Lock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                {title || 'Feature Not Available'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                {description || `Your plan (${planName || 'Basic'}) does not include this feature. Upgrade to access.`}
            </p>
            <Link to="/plans" className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700">
                {ctaLabel || 'Upgrade Plan'}
            </Link>
        </div>
    );
}