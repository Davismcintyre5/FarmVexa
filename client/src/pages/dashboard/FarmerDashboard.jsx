import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getFarmAlerts } from '../../api/alerts';
import { getChats } from '../../api/chat';
import { getAnimals } from '../../api/animals';
import { getStock } from '../../api/stock';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { Wheat, Camera, MessageCircle, Bell, Plus, Package, GitBranch, AlertTriangle, ChevronDown } from 'lucide-react';

export default function FarmerDashboard() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';
    const teamFarmId = user?.farm;

    const [farms, setFarms] = useState([]);
    const [activeFarmId, setActiveFarmId] = useState(isFarmer ? '' : teamFarmId);
    const [alerts, setAlerts] = useState([]);
    const [chats, setChats] = useState([]);
    const [animals, setAnimals] = useState(0);
    const [stockValue, setStockValue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((res) => {
                const list = res.data.data.farms || [];
                setFarms(list);
                if (list.length > 0) setActiveFarmId(list[0]._id);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeFarmId) {
            Promise.all([
                getFarmAlerts(activeFarmId),
                getChats(),
                getAnimals(activeFarmId),
                getStock(activeFarmId),
            ]).then(([a, c, an, st]) => {
                setAlerts((a.data.data.alerts || []).filter((x) => !x.isRead));
                setChats(c.data.data.chats || []);
                setAnimals((an.data.data.animals || []).length);
                const items = st.data.data.items || [];
                setStockValue(items.reduce((s, i) => s + (i.quantity || 0) * (i.pricePerUnit || 0), 0));
            }).catch(() => {});
        }
    }, [activeFarmId]);

    if (loading) return <Spinner size="lg" className="mt-20" />;

    if (isFarmer && farms.length === 0) {
        return (
            <EmptyState icon={Wheat} title="Welcome to FarmVexa!" description="Create your first farm to start monitoring your crops with AI." actionLabel="Create Farm" onAction={() => window.location.href = '/farms/new'} />
        );
    }

    if (!isFarmer && !activeFarmId) {
        return (
            <EmptyState icon={Wheat} title="No farm assigned" description="Contact your farm administrator to be assigned to a farm." />
        );
    }

    const totalAlerts = alerts.length;
    const activeFarm = farms.find((f) => f._id === activeFarmId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{user?.role || 'Farmer'} Dashboard</p>
                </div>
                {isFarmer && farms.length > 1 && (
                    <Select
                        value={activeFarmId}
                        onChange={(e) => setActiveFarmId(e.target.value)}
                        options={farms.map((f) => ({ value: f._id, label: f.name }))}
                        className="w-48"
                    />
                )}
                {!isFarmer && activeFarm && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {activeFarm.name}</p>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                    <Wheat className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isFarmer ? farms.length : 1}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{isFarmer ? 'Farms' : 'Farm'}</p>
                </Card>
                <Card className="text-center">
                    <Bell className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAlerts}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alerts</p>
                </Card>
                <Card className="text-center">
                    <GitBranch className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{animals}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Animals</p>
                </Card>
                <Card className="text-center">
                    <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">KES {stockValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stock Value</p>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Alerts */}
                <Card title="Recent Alerts" footer={totalAlerts > 0 ? <Link to="/alerts" className="text-sm text-primary-500 hover:underline">View all alerts</Link> : null}>
                    {totalAlerts === 0 ? <p className="text-sm text-gray-400 py-4 text-center">No unread alerts</p> : (
                        <div className="space-y-2">
                            {alerts.slice(0, 4).map((alert) => (
                                <div key={alert._id} className="flex items-start gap-2 p-2">
                                    <Badge status={alert.severity} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{alert.message}</p>
                                        <p className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleDateString('en-KE')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Actions */}
                <Card title="Quick Actions">
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/scan" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center gap-3">
                            <Camera className="w-5 h-5 text-primary-500" /><span className="text-sm font-medium">Scan Crop</span>
                        </Link>
                        <Link to="/ai-chat" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center gap-3">
                            <MessageCircle className="w-5 h-5 text-blue-500" /><span className="text-sm font-medium">AI Chat</span>
                        </Link>
                        <Link to="/operations" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center gap-3">
                            <Package className="w-5 h-5 text-green-500" /><span className="text-sm font-medium">Production</span>
                        </Link>
                        <Link to="/alerts" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500" /><span className="text-sm font-medium">Alerts</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}