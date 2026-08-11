import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Clock } from 'lucide-react';

export default function PendingApproval() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Account Pending</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Your account is being reviewed by our team. You'll receive an email at <strong>{user?.email}</strong> once approved.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                    This usually takes less than 24 hours.
                </p>
                <Button variant="outline" onClick={() => { logout(); navigate('/login'); }} className="w-full">
                    Back to Login
                </Button>
            </div>
        </div>
    );
}