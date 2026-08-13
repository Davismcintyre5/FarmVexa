import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AlertComponent from '../../components/ui/Alert';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            setAlert({ type: 'error', message: 'Passwords do not match' });
            return;
        }
        if (!token) {
            setAlert({ type: 'error', message: 'Invalid reset link' });
            return;
        }
        setLoading(true);
        try {
            await resetPassword({ token, newPassword: form.newPassword });
            setAlert({ type: 'success', message: 'Password reset. Redirecting...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Reset failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
            {alert && <AlertComponent type={alert.type} message={alert.message} className="mb-4" />}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="New Password" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="Min 6 characters" />
                <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" />
                <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
            </form>
            <p className="text-sm text-center mt-6"><Link to="/login" className="text-primary-500">Back to Login</Link></p>
        </div>
    );
}