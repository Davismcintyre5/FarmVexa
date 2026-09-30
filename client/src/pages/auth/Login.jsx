import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AlertComponent from '../../components/ui/Alert';
import { validateLogin } from '../../utils/validators';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [allowRegister, setAllowRegister] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        api.get('/admin/public/settings')
            .then((res) => setAllowRegister(res.data?.data?.allowSelfRegistration ?? true))
            .catch(() => setAllowRegister(true));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setAlert(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validateLogin(form);
        if (Object.keys(v).length > 0) {
            setErrors(v);
            return;
        }

        setLoading(true);
        setAlert(null);

        try {
            const payload = await login(form);
            const scope = payload.scope;

            if (scope === 'pending' || scope === 'rejected') navigate('/pending', { replace: true });
            else if (scope === 'expired') navigate('/renewal', { replace: true });
            else navigate('/dashboard', { replace: true });
        } catch (err) {
            if (err.response?.status === 402) {
                navigate('/renewal', { replace: true });
                return;
            }
            setAlert({
                type: 'error',
                message: err.response?.data?.message || 'Login failed',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                    Sign in to your FarmVexa account
                </p>
            </div>

            {alert && <AlertComponent type={alert.type} message={alert.message} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="you@example.com"
                />
                <div className="relative">
                    <Input
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                <div className="text-right">
                    <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <Button type="submit" loading={loading} className="w-full">
                    Sign In
                </Button>
            </form>

            {allowRegister ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/pricing" className="text-primary-500 hover:underline">
                        Create one
                    </Link>
                </p>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
                    Access is by invitation.{' '}
                    <Link to="/get-access" className="text-primary-500 hover:underline">
                        Request access
                    </Link>
                </p>
            )}
        </>
    );
}