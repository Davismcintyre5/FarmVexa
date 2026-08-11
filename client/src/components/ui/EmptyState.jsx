import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title || 'Nothing here yet'}</h3>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
            {actionLabel && onAction && <Button onClick={onAction} className="mt-4">{actionLabel}</Button>}
        </div>
    );
}