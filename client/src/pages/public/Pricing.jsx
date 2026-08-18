import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Pricing() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE}/admin/public/settings`)
            .then((res) => setPlans(res.data.data?.paymentModels || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const planIcons = {
        'Basic': '🌱',
        'Pro': '🚀',
        'Full Suite': '💎',
    };

    const planRoute = (plan) => {
        const name = plan.name.toLowerCase().replace(/\s+/g, '_');
        return `/register?plan=${name}`;
    };

    const isPopular = (plan) => plan.name === 'Pro';

    const basicMonthly = plans.find((p) => p.name === 'Basic Monthly');
    const basicOneTime = plans.find((p) => p.name === 'Basic' && p.interval !== 'monthly');
    const otherPlans = plans.filter((p) => p.name === 'Pro' || p.name === 'Full Suite');

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 py-16">
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900">🌾 FarmVexa Pricing</h1>
                    <p className="text-gray-500 mt-3 text-lg">Choose the plan that fits your farm</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-start">
                    {/* BASIC CARD */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">🌱</div>
                            <h2 className="text-xl font-bold text-gray-900">Basic</h2>
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-3xl font-bold text-green-700">
                                <span className="text-lg align-super">KES</span> {basicMonthly?.price || 500}
                            </p>
                            <p className="text-sm text-gray-500">Monthly</p>
                            <div className="my-3 flex items-center gap-3">
                                <div className="flex-1 border-t border-gray-200" />
                                <span className="text-xs text-gray-400">or</span>
                                <div className="flex-1 border-t border-gray-200" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                <span className="text-lg align-super">KES</span> {basicOneTime?.price || 6000}
                            </p>
                            <p className="text-sm text-gray-500">one-time payment</p>
                        </div>

                        <ul className="space-y-3 mb-6">
                            {basicOneTime?.features?.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-2">
                            <Link
                                to={`/register?plan=basic`}
                                className="block text-center py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition-all"
                            >
                                Pay Once — KES {basicOneTime?.price || 6000}
                            </Link>
                            <Link
                                to={`/register?plan=basic_monthly`}
                                className="block text-center py-3 rounded-xl border-2 border-green-700 text-green-700 font-semibold hover:bg-green-50 transition-all"
                            >
                                Monthly — KES {basicMonthly?.price || 500}/mo
                            </Link>
                        </div>
                    </div>

                    {/* PRO + FULL SUITE */}
                    {otherPlans.map((plan) => (
                        <div
                            key={plan._id}
                            className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 transition-all hover:shadow-xl ${
                                isPopular(plan) ? 'border-green-500' : 'border-gray-200'
                            }`}
                        >
                            {isPopular(plan) && (
                                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                                    ⭐ MOST POPULAR
                                </span>
                            )}

                            <div className="text-center mb-6">
                                <div className="text-4xl mb-2">{planIcons[plan.name] || '🌾'}</div>
                                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-4xl font-bold text-green-700">
                                    <span className="text-lg align-super">KES</span> {plan.price}
                                </p>
                                <p className="text-sm text-gray-500">one-time payment</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features?.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to={planRoute(plan)}
                                className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                                    isPopular(plan)
                                        ? 'bg-green-700 text-white hover:bg-green-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {isPopular(plan) ? 'Get Pro' : `Get ${plan.name}`}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <p className="text-sm text-gray-500">
                        All plans include free updates · No hidden fees · Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    );
}