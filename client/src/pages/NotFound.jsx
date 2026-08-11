import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-500">404</h1>
                <p className="text-xl text-gray-900 dark:text-gray-100 mt-4">Page not found</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
                <Link to="/dashboard" className="inline-block mt-6">
                    <Button><Home className="w-4 h-4" /> Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}