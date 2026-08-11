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
        <div>
            <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
            <p className="text-gray-500 text-center mb-6">Enter your email for a reset link.</p>
            {alert && <AlertComponent type={alert.type} message={alert.message} className="mb-4" />}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
            </form>
            <p className="text-sm text-center mt-6"><Link to="/login" className="text-primary-500">Back to Login</Link></p>
        </div>
    );
}