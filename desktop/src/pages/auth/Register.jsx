import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planParam = searchParams.get('plan') || '';

    const [publicSettings, setPublicSettings] = useState({});
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        county: '',
        subCounty: '',
    });

    useEffect(() => {
        axios.get(`${API_BASE}/admin/public/settings`)
            .then((res) => {
                const data = res.data.data || {};
                setPublicSettings(data);
                setPlans(data.paymentModels || []);
                
                // Find selected plan from URL
                if (planParam) {
                    const found = data.paymentModels?.find(
                        (p) => p.name.toLowerCase().replace(/\s+/g, '_') === planParam
                    );
                    if (found) setSelectedPlan(found);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [planParam]);

    // If self-registration disabled, redirect to get-access
    useEffect(() => {
        if (!loading && publicSettings.allowSelfRegistration === false) {
            navigate('/get-access', { replace: true });
        }
    }, [loading, publicSettings, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (form.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        if (!selectedPlan) {
            return toast.error('Please select a plan');
        }

        // Store form data + plan for checkout
        const registrationData = {
            ...form,
            confirmPassword: undefined,
            selectedPlan: {
                id: selectedPlan._id,
                name: selectedPlan.name,
                price: selectedPlan.price,
                interval: selectedPlan.interval,
            },
        };

        // Save to sessionStorage for checkout page
        sessionStorage.setItem('registrationData', JSON.stringify(registrationData));

        // Navigate to checkout
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-lg mx-auto px-4">
                <Link to="/pricing" className="flex items-center gap-2 text-gray-500 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Pricing
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Register</h1>

                {/* Selected Plan Summary */}
                {selectedPlan && (
                    <Card className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Selected Plan</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {selectedPlan.name}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-700">
                                    KES {selectedPlan.price}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {selectedPlan.interval === 'monthly' ? 'per month' : 'one-time'}
                                </p>
                            </div>
                        </div>
                        <Link to="/pricing" className="text-sm text-primary-500 hover:underline mt-2 inline-block">
                            Change plan
                        </Link>
                    </Card>
                )}

                {/* Plan Selector (if no plan selected) */}
                {!selectedPlan && plans.length > 0 && (
                    <Card className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select a Plan</p>
                        <div className="space-y-2">
                            {plans.map((plan) => (
                                <button
                                    key={plan._id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-primary-500 transition-colors"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
                                    <span className="text-green-700 font-bold">
                                        KES {plan.price}
                                        <span className="text-xs text-gray-400 font-normal">
                                            {' '}{plan.interval === 'monthly' ? '/mo' : 'one-time'}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Registration Form */}
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                        />
                        <Input
                            label="Phone"
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+254 700 000 000"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            required
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repeat password"
                            required
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="County"
                                name="county"
                                value={form.county}
                                onChange={handleChange}
                                placeholder="Nakuru"
                                required
                            />
                            <Input
                                label="Sub-County"
                                name="subCounty"
                                value={form.subCounty}
                                onChange={handleChange}
                                placeholder="Rongai"
                                required
                            />
                        </div>

                        <Button type="submit" loading={submitting} className="w-full" size="lg">
                            Continue to Checkout →
                        </Button>

                        <p className="text-xs text-gray-400 text-center">
                            Your account is not created yet. You'll complete registration at checkout.
                        </p>
                    </form>
                </Card>

                <p className="text-center mt-6 text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}