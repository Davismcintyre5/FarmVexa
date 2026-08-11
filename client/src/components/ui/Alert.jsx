import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

export default function AlertComponent({ type = 'info', message, className = '' }) {
    const Icon = icons[type];
    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${styles[type]} ${className}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{message}</p>
        </div>
    );
}