import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AlertComponent from '../../components/ui/Alert';
import { validateLogin } from '../../utils/validators';
import { Phone, Mail } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [publicSettings, setPublicSettings] = useState({ allowSelfRegistration: true, supportPhone: '', supportEmail: '' });

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setPublicSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validateLogin(form);
        if (Object.keys(v).length > 0) { setErrors(v); return; }
        setLoading(true);
        setAlert(null);
        try {
            const user = await login(form);
            if (user.approvalStatus === 'pending') navigate('/pending');
            else navigate('/dashboard');
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Login failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">Welcome Back</h2>
            {alert && <AlertComponent type={alert.type} message={alert.message} className="mb-4" />}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                <div className="text-right">
                    <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">Forgot password?</Link>
                </div>
                <Button type="submit" loading={loading} className="w-full">Sign In</Button>
            </form>
            {publicSettings.allowSelfRegistration ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
                    Don't have an account? <Link to="/register" className="text-primary-500 hover:underline">Create one</Link>
                </p>
            ) : (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-center space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registration is by invitation only.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact admin to create an account:</p>
                    {publicSettings.supportPhone && (
                        <a href={`tel:${publicSettings.supportPhone}`} className="flex items-center justify-center gap-2 text-primary-500 font-medium">
                            <Phone className="w-4 h-4" /> {publicSettings.supportPhone}
                        </a>
                    )}
                    {publicSettings.supportEmail && (
                        <a href={`mailto:${publicSettings.supportEmail}`} className="flex items-center justify-center gap-2 text-primary-500 font-medium">
                            <Mail className="w-4 h-4" /> {publicSettings.supportEmail}
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}