import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, ArrowUpCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Plans() {
    const navigate = useNavigate();
    const [plansData, setPlansData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`${API_BASE}/farm/plans`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setPlansData(res.data.data || res.data))
            .catch(() => toast.error('Failed to load plans'))
            .finally(() => setLoading(false));
    }, [navigate]);

    const planIcons = {
        'Basic Monthly': '🌱',
        'Basic': '🌱',
        'Pro': '🚀',
        'Full Suite': '💎',
    };

    const features = {
        'Basic Monthly': ['AI Crop Scanning', 'Field Scan (Phone)', 'Livestock', 'Finance', 'AI Chat', 'Market'],
        'Basic': ['AI Crop Scanning', 'Field Scan (Phone)', 'Livestock', 'Finance', 'AI Chat', 'Market'],
        'Pro': ['Everything in Basic', 'IoT Field Sensors', 'Field Scan with GPS', 'Soil Moisture', 'Temp & Humidity', 'Real-time Dashboard'],
        'Full Suite': ['Everything in Pro', 'Storage Monitoring', 'CO2 Insect Detection', 'PIR Rat Detection', 'Pest Alert System', 'Priority Support'],
    };

    const hasPendingUpgrade = !!plansData?.pendingUpgrade;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plans & Upgrades</h1>
                    {plansData?.currentPlan && (
                        <p className="text-gray-500 mt-2">
                            Current Plan: <strong className="text-green-700">{plansData.currentPlan}</strong>
                        </p>
                    )}
                </div>

                {/* Pending Upgrade Banner */}
                {hasPendingUpgrade && (
                    <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700">
                        <div className="flex items-start gap-3">
                            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                                    ⏳ Upgrade In Progress
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                    {plansData.pendingUpgrade.oldPlan} → <strong>{plansData.pendingUpgrade.newPlan}</strong>
                                </p>
                                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 space-y-1">
                                    <p>Amount: KES {plansData.pendingUpgrade.amount}</p>
                                    <p>Reference: {plansData.pendingUpgrade.paymentReference}</p>
                                    <p>Submitted: {new Date(plansData.pendingUpgrade.submittedAt).toLocaleString('en-KE')}</p>
                                </div>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                    Admin is verifying your payment. You'll receive an email when approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                    {plansData?.plans?.map((plan) => {
                        const isPendingTarget = hasPendingUpgrade && plansData.pendingUpgrade.newPlan === plan.name;
                        const allBlocked = hasPendingUpgrade;

                        return (
                            <div
                                key={plan.name}
                                className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 transition-all flex flex-col ${
                                    isPendingTarget
                                        ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10'
                                        : plan.status === 'current'
                                        ? 'border-green-500'
                                        : plan.status === 'upgrade_available'
                                        ? 'border-blue-400'
                                        : 'border-gray-200'
                                }`}
                            >
                                <div className="text-center mb-4">
                                    <div className="text-4xl mb-2">{planIcons[plan.name] || '🌾'}</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                </div>

                                <div className="text-center mb-4">
                                    <p className="text-3xl font-bold text-green-700">
                                        <span className="text-sm align-super">KES</span> {plan.price}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {plan.interval === 'monthly' ? 'per month' : 'one-time'}
                                    </p>
                                </div>

                                {plan.status === 'upgrade_available' && !allBlocked && (
                                    <div className="text-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <p className="text-sm text-gray-500">You pay</p>
                                        <p className="text-2xl font-bold text-blue-600">KES {plan.upgradeCost}</p>
                                    </div>
                                )}

                                <ul className="space-y-2 mb-6 flex-grow">
                                    {features[plan.name]?.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    {isPendingTarget && (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-yellow-100 text-yellow-700 font-semibold flex items-center justify-center gap-2">
                                            <Clock className="w-4 h-4" /> Upgrade In Progress
                                        </button>
                                    )}
                                    {!isPendingTarget && plan.status === 'current' && !allBlocked && (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Current Plan
                                        </button>
                                    )}
                                    {!isPendingTarget && plan.status === 'purchased' && !allBlocked && (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 font-semibold flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Purchased
                                        </button>
                                    )}
                                    {!isPendingTarget && plan.status === 'upgrade_available' && !allBlocked && (
                                        <Link
                                            to={`/plans/upgrade/${plan.name.toLowerCase().replace(/\s+/g, '_')}`}
                                            className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                                        >
                                            <ArrowUpCircle className="w-4 h-4" /> Upgrade — KES {plan.upgradeCost}
                                        </Link>
                                    )}
                                    {allBlocked && !isPendingTarget && plan.status === 'upgrade_available' && (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-gray-200 text-gray-500 font-semibold flex items-center justify-center gap-2">
                                            <Clock className="w-4 h-4" /> Blocked — Pending Upgrade
                                        </button>
                                    )}
                                    {allBlocked && plan.status === 'current' && (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Current Plan
                                        </button>
                                    )}
                                    {allBlocked && plan.status === 'purchased' && (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 font-semibold flex items-center justify-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Purchased
                                        </button>
                                    )}
                                    {plan.status === 'available' && !allBlocked && (
                                        <Link
                                            to={`/register?plan=${plan.name.toLowerCase().replace(/\s+/g, '_')}`}
                                            className="w-full py-2.5 rounded-xl bg-green-700 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-800 transition-all"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}