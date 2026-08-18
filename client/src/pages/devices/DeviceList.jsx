import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getDevices, deleteDevice } from '../../api/devices';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import { Cpu, Plus, Trash2, AlertTriangle } from 'lucide-react';

export default function DeviceList() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';
    const canManage = ['farmer', 'manager'].includes(user?.role);

    const [devices, setDevices] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    const hasIotAccess = ['Pro', 'Full Suite'].includes(user?.selectedPlan);

    useEffect(() => {
        if (!hasIotAccess) {
            setLoading(false);
            return;
        }

        if (isFarmer) {
            getFarms().then(async (res) => {
                const list = res.data.data.farms || [];
                setFarms(list);
                const all = [];
                for (const f of list) {
                    try { const d = await getDevices(f._id); all.push(...(d.data.data.devices || [])); } catch {}
                }
                setDevices(all);
            }).finally(() => setLoading(false));
        } else if (user?.farm) {
            getDevices(user.farm)
                .then((d) => setDevices(d.data.data.devices || []))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isFarmer, user, hasIotAccess]);

    const handleDelete = async (id) => { 
        if (confirm('Delete?')) { 
            await deleteDevice(id); 
            setDevices((p) => p.filter((d) => d._id !== id)); 
        } 
    };

    const getZoneBadge = (zone) => {
        const colors = {
            field: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            storage: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            greenhouse: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            livestock: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        };
        return colors[zone] || colors.field;
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;

    if (!hasIotAccess) {
        return (
            <div className="page-container max-w-lg mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Devices</h1>
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700 text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                        Feature Not Available
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Your plan ({user?.selectedPlan || 'Basic'}) does not include IoT Devices.
                        Upgrade to Pro or Full Suite to connect sensors.
                    </p>
                    <Link to="/plans" className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700">
                        Upgrade Plan
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container space-y-6">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Devices</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{devices.length} device{devices.length !== 1 ? 's' : ''}</p>
                </div>
                {canManage && <Link to="/devices/register"><Button><Plus className="w-4 h-4" /> Register</Button></Link>}
            </div>

            {devices.length === 0 ? (
                <EmptyState icon={Cpu} title="No devices" description={canManage ? 'Register an ESP32 sensor node.' : 'No devices registered.'} actionLabel={canManage ? 'Register Device' : undefined} onAction={canManage ? () => window.location.href = '/devices/register' : undefined} />
            ) : (
                <div className="space-y-3">
                    {devices.map((device) => (
                        <Link key={device._id} to={`/devices/${device._id}`}>
                            <Card hover>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{device.deviceId}</p>
                                            {device.zone && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getZoneBadge(device.zone)}`}>
                                                    {device.zone}
                                                </span>
                                            )}
                                            {device.sensorType && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                    {device.sensorType}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">Last seen: {formatDate(device.lastSeen, 'relative')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge status={device.status} />
                                        <span className="text-sm">{device.batteryLevel}%</span>
                                        {canManage && (
                                            <button onClick={(e) => { e.preventDefault(); handleDelete(device._id); }} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}