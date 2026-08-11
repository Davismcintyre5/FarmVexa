import { getStatusColor } from '../../utils/formatters';

export default function Badge({ status, label, className = '' }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
            {label || status}
        </span>
    );
}