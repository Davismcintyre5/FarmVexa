export const formatDate = (date, format = 'full') => {
    const d = new Date(date);
    const options = {
        full: { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Nairobi' },
        date: { dateStyle: 'medium', timeZone: 'Africa/Nairobi' },
        time: { timeStyle: 'short', timeZone: 'Africa/Nairobi' },
        relative: null,
    };

    if (format === 'relative') {
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return d.toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' });
    }

    return d.toLocaleString('en-KE', options[format] || options.full);
};

export const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return Number(num).toLocaleString();
};

export const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${Math.round(value)}%`;
};

export const formatTemperature = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(1)}°C`;
};

export const getStatusColor = (status) => {
    const colors = {
        online: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        offline: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || colors.inactive;
};

export const truncate = (str, length = 50) => {
    if (!str) return '';
    return str.length > length ? `${str.substring(0, length)}...` : str;
};