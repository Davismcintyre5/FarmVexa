import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AlertComponent from '../../components/ui/Alert';
import { validateRegistration } from '../../utils/validators';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        county: '', subCounty: '', agreeToTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateRegistration(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        setAlert(null);
        try {
            await register(form);
            navigate('/pending');
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">Create Account</h2>
            {alert && <AlertComponent type={alert.type} message={alert.message} className="mb-4" />}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="John Farmer" />
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="+254712345678" />
                <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Min 6 characters" />
                <Input label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Repeat password" />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="County" name="county" value={form.county} onChange={handleChange} placeholder="Kiambu" />
                    <Input label="Sub-County" name="subCounty" value={form.subCounty} onChange={handleChange} placeholder="Limuru" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" name="agreeToTerms" checked={form.agreeToTerms} onChange={handleChange} className="rounded" />
                    I agree to the Terms of Service
                </label>
                {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
                <Button type="submit" loading={loading} className="w-full">Create Account</Button>
            </form>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
                Already have an account? <Link to="/login" className="text-primary-500 hover:underline">Sign in</Link>
            </p>
        </div>
    );
}