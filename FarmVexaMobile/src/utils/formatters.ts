export const formatDate = (date: Date | string, format: 'full' | 'date' | 'time' | 'relative' = 'full') => {
  const d = new Date(date);
  
  if (format === 'relative') {
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' });
  }

  const options: Intl.DateTimeFormatOptions = {
    full: { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Nairobi' },
    date: { dateStyle: 'medium', timeZone: 'Africa/Nairobi' },
    time: { timeStyle: 'short', timeZone: 'Africa/Nairobi' },
  }[format];

  return d.toLocaleString('en-KE', options);
};

export const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return 'N/A';
  return Number(num).toLocaleString();
};

export const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'KES 0';
  return `KES ${Number(amount).toLocaleString()}`;
};

export const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value)}%`;
};

export const formatTemperature = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(1)}°C`;
};

export const formatPhoneNumber = (phone: string) => {
  if (!phone) return '';
  // Convert 07XX to +2547XX
  if (phone.startsWith('0')) {
    return '+254' + phone.slice(1);
  }
  return phone;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    online: '#dcfce7',
    offline: '#fee2e2',
    pending: '#fef9c3',
    approved: '#dcfce7',
    rejected: '#fee2e2',
    active: '#dcfce7',
    inactive: '#f3f4f6',
    low: '#dbeafe',
    medium: '#fef9c3',
    high: '#ffedd5',
    critical: '#fee2e2',
    completed: '#dcfce7',
    in_progress: '#dbeafe',
    sold: '#fef9c3',
    expired: '#fee2e2',
    available: '#dcfce7',
    unavailable: '#f3f4f6',
  };
  return colors[status] || colors.inactive;
};

export const getStatusTextColor = (status: string): string => {
  const colors: Record<string, string> = {
    online: '#166534',
    offline: '#991b1b',
    pending: '#854d0e',
    approved: '#166534',
    rejected: '#991b1b',
    active: '#166534',
    inactive: '#374151',
    low: '#1e40af',
    medium: '#854d0e',
    high: '#9a3412',
    critical: '#991b1b',
    completed: '#166534',
    in_progress: '#1e40af',
    sold: '#854d0e',
    expired: '#991b1b',
    available: '#166534',
    unavailable: '#374151',
  };
  return colors[status] || colors.inactive;
};

export const truncate = (str: string, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const capitalize = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};