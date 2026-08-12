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
import { Cpu, Plus, Trash2 } from 'lucide-react';

export default function DeviceList() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';
    const canManage = ['farmer', 'manager'].includes(user?.role);

    const [devices, setDevices] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [isFarmer, user]);

    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteDevice(id); setDevices((p) => p.filter((d) => d._id !== id)); } };

    if (loading) return <Spinner size="lg" className="mt-20" />;

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
                                        <p className="font-semibold">{device.deviceId}</p>
                                        <p className="text-sm text-gray-500">Last seen: {formatDate(device.lastSeen, 'relative')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge status={device.status} />
                                        <span className="text-sm">{device.batteryLevel}%</span>
                                        {canManage && (
                                            <button onClick={(e) => { e.preventDefault(); handleDelete(device._id); }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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