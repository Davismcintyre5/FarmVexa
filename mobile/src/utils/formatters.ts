export const formatDate = (date: string | Date, type: 'full' | 'relative' | 'time' = 'full') => {
    const d = new Date(date);
    if (type === 'relative') {
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-KE');
    }
    if (type === 'time') {
        return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatTemperature = (temp: number) => `${temp?.toFixed(1) || 'N/A'}°C`;

export const formatCurrency = (amount: number) => `KES ${amount?.toLocaleString() || 0}`;

export const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://farmvexaserver.pxxl.click/${url}`;
};