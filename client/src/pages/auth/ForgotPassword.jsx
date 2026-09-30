import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AlertComponent from '../../components/ui/Alert';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);
        try {
            await forgotPassword(email);
            setAlert({ type: 'success', message: 'Reset link sent to your email.' });
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot Password</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            {alert && <AlertComponent type={alert.type} message={alert.message} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />
                <Button type="submit" loading={loading} className="w-full">
                    Send Reset Link
                </Button>
            </form>

            <p className="text-sm text-center mt-6">
                <Link to="/login" className="text-primary-500 hover:underline">
                    Back to Login
                </Link>
            </p>
        </>
    );
}