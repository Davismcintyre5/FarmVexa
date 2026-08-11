import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getFarmAlerts } from '../../api/alerts';
import { getChats } from '../../api/chat';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { formatDate, formatPercentage } from '../../utils/formatters';
import { Wheat, Camera, MessageCircle, Bell, Cpu, Plus } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [farms, setFarms] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [farmsRes, chatsRes] = await Promise.all([
                    getFarms(),
                    getChats(),
                ]);
                setFarms(farmsRes.data.data.farms || []);
                setChats(chatsRes.data.data.chats || []);

                if (farmsRes.data.data.farms?.length > 0) {
                    const alertsRes = await getFarmAlerts(farmsRes.data.data.farms[0]._id);
                    setAlerts(alertsRes.data.data.alerts || []);
                }
            } catch (err) {
                console.error('Dashboard load failed:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner size="lg" className="mt-20" />;

    if (farms.length === 0) {
        return (
            <EmptyState
                icon={Wheat}
                title="Welcome to FarmVexa!"
                description="Create your first farm to start monitoring your crops with AI."
                actionLabel="Create Farm"
                onAction={() => window.location.href = '/farms/new'}
            />
        );
    }

    const totalAlerts = alerts.filter((a) => !a.isRead).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your farm overview.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                    <Wheat className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{farms.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Farms</p>
                </Card>
                <Card className="text-center">
                    <Bell className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAlerts}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alerts</p>
                </Card>
                <Card className="text-center">
                    <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{chats.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chats</p>
                </Card>
                <Card className="text-center">
                    <Cpu className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Devices</p>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card title="My Farms" footer={
                    <Link to="/farms" className="text-sm text-primary-500 hover:underline">View all farms</Link>
                }>
                    <div className="space-y-3">
                        {farms.slice(0, 3).map((farm) => (
                            <Link key={farm._id} to={`/farms/${farm._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{farm.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{farm.location?.county}</p>
                                </div>
                                <Badge status={farm.status} />
                            </Link>
                        ))}
                    </div>
                </Card>

                <Card title="Recent Alerts" footer={
                    <Link to="/alerts" className="text-sm text-primary-500 hover:underline">View all alerts</Link>
                }>
                    <div className="space-y-3">
                        {alerts.slice(0, 3).map((alert) => (
                            <div key={alert._id} className="flex items-start gap-3 p-2">
                                <Badge status={alert.severity} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.message}</p>
                                    <p className="text-xs text-gray-400">{formatDate(alert.createdAt, 'relative')}</p>
                                </div>
                            </div>
                        ))}
                        {alerts.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No alerts</p>}
                    </div>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Link to="/scan" className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center gap-3">
                    <Camera className="w-6 h-6 text-primary-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Scan Crop</span>
                </Link>
                <Link to="/chat" className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">AI Chat</span>
                </Link>
                <Link to="/farms/new" className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center gap-3">
                    <Plus className="w-6 h-6 text-green-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Add Farm</span>
                </Link>
            </div>
        </div>
    );
}