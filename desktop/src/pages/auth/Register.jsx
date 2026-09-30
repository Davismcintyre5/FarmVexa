import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planParam = searchParams.get('plan') || '';

    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', county: '', subCounty: '',
    });

    useEffect(() => {
        axios.get(`${API_BASE}/admin/public/settings`)
            .then((res) => {
                const data = res.data.data || {};
                setPlans(data.paymentModels || []);
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

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        if (!selectedPlan) return toast.error('Please select a plan');

        setSubmitting(true);
        try {
            await register({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                county: form.county,
                subCounty: form.subCounty,
                plan: selectedPlan.name,
            });
            navigate('/pending', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">Create Account</h2>

            {selectedPlan ? (
                <Card className="mb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500">Selected Plan</p>
                            <p className="font-bold text-gray-900">{selectedPlan.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-green-700">KES {selectedPlan.price}</p>
                            <p className="text-xs text-gray-400">{selectedPlan.interval === 'monthly' ? 'per month' : 'one-time'}</p>
                        </div>
                    </div>
                </Card>
            ) : plans.length > 0 && (
                <Card className="mb-4">
                    <p className="text-sm font-semibold mb-3">Select a Plan</p>
                    <div className="space-y-2">
                        {plans.map((plan) => (
                            <button
                                key={plan._id}
                                type="button"
                                onClick={() => setSelectedPlan(plan)}
                                className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-primary-500"
                            >
                                <span className="font-medium">{plan.name}</span>
                                <span className="text-green-700 font-bold">KES {plan.price}</span>
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                <Input label="Phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+254 700 000 000" required />
                <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
                <Input label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="County" name="county" value={form.county} onChange={handleChange} placeholder="Nakuru" required />
                    <Input label="Sub-County" name="subCounty" value={form.subCounty} onChange={handleChange} placeholder="Rongai" required />
                </div>
                <Button type="submit" loading={submitting} className="w-full" size="lg">
                    Create Account
                </Button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-primary-500 hover:underline">Login</Link>
            </p>
        </div>
    );
}