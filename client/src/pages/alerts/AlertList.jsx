import { useState, useEffect } from 'react';
import { getFarms } from '../../api/farms';
import { getFarmAlerts, markAlertRead } from '../../api/alerts';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Bell, CheckCircle, Trash2, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AlertList() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [farmId, setFarmId] = useState(null);

    useEffect(() => {
        getFarms().then(async (res) => {
            const farms = res.data.data.farms || [];
            const all = [];
            for (const f of farms) {
                try {
                    const a = await getFarmAlerts(f._id);
                    const list = (a.data.data.alerts || []).map((x) => ({ ...x, farmId: f._id }));
                    all.push(...list);
                } catch {}
            }
            all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAlerts(all);
            if (farms.length > 0) setFarmId(farms[0]._id);
        }).finally(() => setLoading(false));
    }, []);

    const handleMarkRead = async (id) => {
        await markAlertRead(id);
        setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, isRead: true } : a));
        toast.success('Marked as read');
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this alert?')) return;
        await api.delete(`/farm/alerts/${id}`);
        setAlerts((prev) => prev.filter((a) => a._id !== id));
        toast.success('Alert deleted');
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete all alerts?')) return;
        for (const f of [...new Set(alerts.map((a) => a.farmId))]) {
            try { await api.delete(`/farm/alerts/farm/${f}/all`); } catch {}
        }
        setAlerts([]);
        toast.success('All alerts deleted');
    };

    const unreadCount = alerts.filter((a) => !a.isRead).length;

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alerts</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                </div>
                {alerts.length > 0 && (
                    <Button variant="outline" onClick={handleDeleteAll} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" /> Clear All
                    </Button>
                )}
            </div>

            {alerts.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="No alerts"
                    description="Everything looks good on your farm."
                />
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <Card key={alert._id} className={alert.isRead ? 'opacity-60' : ''}>
                            <div className="flex items-start gap-3">
                                <Badge status={alert.severity} />
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-gray-900 dark:text-gray-100 ${!alert.isRead ? 'font-semibold' : ''}`}>
                                        {alert.message}
                                    </p>
                                    {alert.recommendation && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {alert.recommendation}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        {formatDate(alert.createdAt, 'relative')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {!alert.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(alert._id)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-500"
                                            title="Mark as read"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(alert._id)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}