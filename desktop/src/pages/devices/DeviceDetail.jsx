import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDevice, deleteDevice } from '../../api/devices';
import { getDeviceReadings } from '../../api/sensors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTemperature } from '../../utils/formatters';
import { ArrowLeft, Battery, Wifi, Trash2, MapPin, Cpu } from 'lucide-react';

export default function DeviceDetail() {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const canManage = ['farmer', 'manager'].includes(user?.role);

    const [device, setDevice] = useState(null);
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDevice(deviceId), getDeviceReadings(deviceId, 5)])
            .then(([d, r]) => { setDevice(d.data.data.device); setReadings(r.data.data.readings || []); })
            .finally(() => setLoading(false));
    }, [deviceId]);

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to="/devices" className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Card>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-xl font-bold">{device.deviceId}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-500">
                                {device.zone === 'storage' ? 'Storage' : device.field?.name || 'Unassigned'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Cpu className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-500 capitalize">{device.sensorType || 'dht'} sensor</p>
                        </div>
                    </div>
                    <Badge status={device.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-green-500" />
                        <span>{device.batteryLevel || '?'}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-blue-500" />
                        <span>{device.status === 'online' ? 'Connected' : 'Offline'}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-400">Last seen: {formatDate(device.lastSeen)}</p>
                <p className="text-sm text-gray-400">Firmware: {device.firmwareVersion || 'N/A'}</p>
                {canManage && (
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/devices')}>Back</Button>
                        <Button variant="ghost" onClick={async () => { if (confirm('Delete?')) { await deleteDevice(deviceId); navigate('/devices'); } }} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </Card>
            {readings.length > 0 && (
                <Card title="Recent Readings">
                    {readings.map((r, i) => (
                        <div key={i} className="flex justify-between py-1 text-sm">
                            <span>{formatDate(r.timestamp, 'time')}</span>
                            {r.temperature !== undefined && <span>{formatTemperature(r.temperature)}</span>}
                            {r.humidity !== undefined && <span>{r.humidity}%</span>}
                            {r.soilMoisture !== undefined && <span>{r.soilMoisture}%</span>}
                            {r.co2 !== undefined && <span>{r.co2} ppm</span>}
                            {r.motion !== undefined && <span>{r.motion ? '🐀 Motion' : ''}</span>}
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );
}