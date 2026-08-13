import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check } from 'lucide-react';

export default function Pricing() {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setPlans(res.data.data?.paymentModels || []))
            .catch(() => {});
    }, []);

    if (plans.length === 0) return null;

    return (
        <section id="pricing" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Simple Pricing</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Choose the plan that fits your farm.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((p, i) => (
                        <div key={i} className={`bg-white dark:bg-gray-800 p-8 rounded-2xl border-2 ${p.isDefault ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'} relative`}>
                            {p.isDefault && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm">Popular</span>}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{p.name}</h3>
                            <div className="mt-4 mb-6">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">KES {p.price?.toLocaleString()}</span>
                                <span className="text-gray-500">/{p.interval}</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {(p.features || []).map((f, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Check className="w-4 h-4 text-green-500" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <a href="/register" className="block text-center w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors">
                                Get Started
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}