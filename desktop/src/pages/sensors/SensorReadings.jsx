import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import usePlanAccess from '../../hooks/usePlanAccess';
import axios from 'axios';
import { getFarms } from '../../api/farms';
import { getFields } from '../../api/fields';
import { getFieldReadings, getDeviceReadings } from '../../api/sensors';
import { getDevices } from '../../api/devices';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Activity, Thermometer, Droplets, Sun, TrendingUp, TrendingDown, Minus, Box, Bug, Rat, AlertTriangle, Sparkles } from 'lucide-react';
import { formatDate, formatTemperature } from '../../utils/formatters';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function SensorReadings() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const { allowed: hasIotAccess, loading: iotLoading, planName } = usePlanAccess('iot_field_sensors');
    const { allowed: hasStorageAccess, loading: storageLoading } = usePlanAccess('storage_monitoring');

    const [activeTab, setActiveTab] = useState('field');
    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [farmsLoaded, setFarmsLoaded] = useState(false);

    const [storageDevices, setStorageDevices] = useState([]);
    const [storageDeviceId, setStorageDeviceId] = useState('');
    const [storageReadings, setStorageReadings] = useState([]);

    const [virtualDevices, setVirtualDevices] = useState([]);
    const [virtualDeviceId, setVirtualDeviceId] = useState('');
    const [virtualReadings, setVirtualReadings] = useState([]);
    const [showVirtualTab, setShowVirtualTab] = useState(false);

    useEffect(() => {
        if (iotLoading) return;
        if (!hasIotAccess) return;
        if (!isFarmer && user?.farm) {
            setFarmId(user.farm);
            setFarms([{ _id: user.farm, name: 'Assigned Farm' }]);
            setFarmsLoaded(true);
            getFields(user.farm).then((res) => setFields(res.data.data.fields || [])).catch(() => {});
            fetchStorageDevices(user.farm);
            fetchVirtualDevices();
        }
    }, [user, hasIotAccess, iotLoading]);

    useEffect(() => {
        if (iotLoading) return;
        if (!hasIotAccess) return;
        if (isFarmer) {
            getFarms().then((res) => {
                setFarms(res.data.data.farms || []);
                setFarmsLoaded(true);
            });
            fetchVirtualDevices();
        }
    }, [isFarmer, hasIotAccess, iotLoading]);

    useEffect(() => {
        if (fieldId && activeTab === 'field' && hasIotAccess) {
            setLoading(true);
            getFieldReadings(fieldId, 50).then((res) => setReadings(res.data.data.readings || [])).finally(() => setLoading(false));
        }
    }, [fieldId, activeTab, hasIotAccess]);

    useEffect(() => {
        if (storageDeviceId && activeTab === 'storage' && hasStorageAccess) {
            setLoading(true);
            getDeviceReadings(storageDeviceId, 50).then((res) => setStorageReadings(res.data.data.readings || [])).finally(() => setLoading(false));
        }
    }, [storageDeviceId, activeTab, hasStorageAccess]);

    useEffect(() => {
        if (virtualDeviceId && activeTab === 'virtual') {
            setLoading(true);
            getDeviceReadings(virtualDeviceId, 50)
                .then((res) => setVirtualReadings(res.data.data?.readings || []))
                .catch(() => setVirtualReadings([]))
                .finally(() => setLoading(false));
        }
    }, [virtualDeviceId, activeTab]);

    const fetchVirtualDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/farm/devices/virtual`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const devices = res.data.data?.devices || [];
            setVirtualDevices(devices);
            setShowVirtualTab(devices.length > 0);

            if (devices.length > 0) {
                setVirtualDeviceId(devices[0]._id);

                const readingsRes = await axios.get(`${API_BASE}/farm/sensors/device/${devices[0]._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setVirtualReadings(readingsRes.data.data?.readings || []);
            }
        } catch {
            setVirtualDevices([]);
            setShowVirtualTab(false);
        }
    };

    const handleFarmChange = async (id) => {
        setFarmId(id); setFieldId(''); setReadings([]);
        setStorageDevices([]); setStorageDeviceId(''); setStorageReadings([]);
        if (id) {
            const res = await getFields(id);
            setFields(res.data.data.fields || []);
            fetchStorageDevices(id);
        }
    };

    const fetchStorageDevices = async (farmId) => {
        try {
            const res = await getDevices(farmId);
            const devices = res.data.data.devices || [];
            const storageOnly = devices.filter((d) => d.zone === 'storage');
            setStorageDevices(storageOnly);
        } catch {
            setStorageDevices([]);
        }
    };

    const latest = readings[0];
    const prev = readings[1];
    const storageLatest = storageReadings[0];
    const storagePrev = storageReadings[1];
    const virtualLatest = virtualReadings[0];
    const virtualPrev = virtualReadings[1];

    const trend = (curr, prev) => {
        if (!curr || !prev) return null;
        if (curr > prev) return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (curr < prev) return <TrendingDown className="w-4 h-4 text-green-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    if (iotLoading) return <Spinner size="lg" className="mt-20" />;

    if (!hasIotAccess) {
        return (
            <div className="page-container max-w-lg mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sensor Readings</h1>
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700 text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                        Feature Not Available
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Your plan ({planName || 'Basic'}) does not include IoT Sensors.
                        Upgrade to access field monitoring.
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sensor Readings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor field and storage conditions in real-time</p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('field')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'field'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                >
                    <Activity className="w-4 h-4" /> Field
                </button>
                <button
                    onClick={() => setActiveTab('storage')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                        activeTab === 'storage'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                >
                    <Box className="w-4 h-4" /> Storage
                </button>
                {showVirtualTab && (
                    <button
                        onClick={() => setActiveTab('virtual')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                            activeTab === 'virtual'
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" /> Virtual
                    </button>
                )}
            </div>

            {activeTab === 'virtual' && (
                <>
                    <Card>
                        <Select
                            label="Virtual Device"
                            value={virtualDeviceId}
                            onChange={(e) => setVirtualDeviceId(e.target.value)}
                            options={virtualDevices.map((d) => ({
                                value: d._id,
                                label: d.farm?.name ? `${d.farm.name} — ${d.name}` : d.name
                            }))}
                        />
                    </Card>

                    {loading ? <Spinner size="lg" className="mt-10" /> : !virtualDeviceId ? (
                        <EmptyState icon={Sparkles} title="Select a virtual device" description="Choose a virtual device to view generated readings." />
                    ) : virtualReadings.length === 0 ? (
                        <EmptyState icon={Sparkles} title="No readings yet" description="The scheduler will generate readings soon." />
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Thermometer className="w-5 h-5 text-red-500" />{trend(virtualLatest?.temperature, virtualPrev?.temperature)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{virtualLatest?.temperature !== undefined ? formatTemperature(virtualLatest.temperature) : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Temperature</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Droplets className="w-5 h-5 text-blue-500" />{trend(virtualLatest?.humidity, virtualPrev?.humidity)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{virtualLatest?.humidity !== undefined ? `${virtualLatest.humidity}%` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Humidity</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Droplets className="w-5 h-5 text-green-500" />{trend(virtualLatest?.soilMoisture, virtualPrev?.soilMoisture)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{virtualLatest?.soilMoisture !== undefined ? `${virtualLatest.soilMoisture}%` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Soil Moisture</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Sun className="w-5 h-5 text-yellow-500" />{trend(virtualLatest?.lightLevel, virtualPrev?.lightLevel)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{virtualLatest?.lightLevel !== undefined ? virtualLatest.lightLevel : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Light Level</p>
                                </Card>
                            </div>

                            <Card title="Virtual Reading History">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="px-4 py-3 text-left font-medium text-gray-500">Time</th><th className="px-4 py-3 text-left font-medium text-gray-500">Temp</th><th className="px-4 py-3 text-left font-medium text-gray-500">Humidity</th><th className="px-4 py-3 text-left font-medium text-gray-500">Soil</th><th className="px-4 py-3 text-left font-medium text-gray-500">Light</th></tr></thead>
                                        <tbody>{virtualReadings.map((r, i) => (<tr key={i} className="border-b border-gray-100 dark:border-gray-800"><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatDate(r.timestamp, 'time')}</td><td className="px-4 py-3">{formatTemperature(r.temperature)}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.humidity ? `${r.humidity}%` : 'N/A'}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.soilMoisture ? `${r.soilMoisture}%` : 'N/A'}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.lightLevel || 'N/A'}</td></tr>))}</tbody>
                                    </table>
                                </div>
                            </Card>
                        </>
                    )}
                </>
            )}

            {activeTab === 'field' && (
                <>
                    <Card>
                        <div className="grid md:grid-cols-2 gap-4">
                            {isFarmer ? (
                                <>
                                    {farmsLoaded && <Select label="Farm" value={farmId} onChange={(e) => handleFarmChange(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} />}
                                    <Select label="Field" value={fieldId} onChange={(e) => setFieldId(e.target.value)} options={fields.map((f) => ({ value: f._id, label: f.name }))} />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>
                                    <Select label="Field" value={fieldId} onChange={(e) => setFieldId(e.target.value)} options={fields.map((f) => ({ value: f._id, label: f.name }))} />
                                </>
                            )}
                        </div>
                    </Card>

                    {loading ? <Spinner size="lg" className="mt-10" /> : !fieldId ? <EmptyState icon={Activity} title="Select a field" description="Choose a farm and field to view sensor data." /> : readings.length === 0 ? <EmptyState icon={Activity} title="No readings yet" description="No sensor data for this field. Connect a device to start monitoring." /> : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Thermometer className="w-5 h-5 text-red-500" />{trend(latest?.temperature, prev?.temperature)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTemperature(latest?.temperature)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Temperature</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Droplets className="w-5 h-5 text-blue-500" />{trend(latest?.humidity, prev?.humidity)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{latest?.humidity ? `${latest.humidity}%` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Humidity</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Droplets className="w-5 h-5 text-green-500" />{trend(latest?.soilMoisture, prev?.soilMoisture)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{latest?.soilMoisture ? `${latest.soilMoisture}%` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Soil Moisture</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Sun className="w-5 h-5 text-yellow-500" />{trend(latest?.lightLevel, prev?.lightLevel)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{latest?.lightLevel || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Light Level</p>
                                </Card>
                            </div>

                            <Card title="Reading History">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="px-4 py-3 text-left font-medium text-gray-500">Time</th><th className="px-4 py-3 text-left font-medium text-gray-500">Temp</th><th className="px-4 py-3 text-left font-medium text-gray-500">Humidity</th><th className="px-4 py-3 text-left font-medium text-gray-500">Soil</th><th className="px-4 py-3 text-left font-medium text-gray-500">Light</th></tr></thead>
                                        <tbody>{readings.map((r, i) => (<tr key={i} className="border-b border-gray-100 dark:border-gray-800"><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatDate(r.timestamp, 'time')}</td><td className="px-4 py-3">{formatTemperature(r.temperature)}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.humidity ? `${r.humidity}%` : 'N/A'}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.soilMoisture ? `${r.soilMoisture}%` : 'N/A'}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.lightLevel || 'N/A'}</td></tr>))}</tbody>
                                    </table>
                                </div>
                            </Card>
                        </>
                    )}
                </>
            )}

            {activeTab === 'storage' && storageLoading && (
                <Spinner size="lg" className="mt-10" />
            )}

            {activeTab === 'storage' && !storageLoading && !hasStorageAccess && (
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700 text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                        Storage Monitoring Not Available
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Your plan ({planName || 'Basic'}) does not include Storage Monitoring.
                        Upgrade to access CO2 and PIR sensors.
                    </p>
                    <Link to="/plans" className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700">
                        Upgrade Plan
                    </Link>
                </div>
            )}

            {activeTab === 'storage' && !storageLoading && hasStorageAccess && (
                <>
                    <Card>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Select label="Farm" value={farmId} onChange={(e) => handleFarmChange(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} />
                            <Select label="Storage Device" value={storageDeviceId} onChange={(e) => setStorageDeviceId(e.target.value)} options={storageDevices.map((d) => ({ value: d._id, label: `${d.deviceId} (${d.sensorType})` }))} />
                        </div>
                    </Card>

                    {loading ? <Spinner size="lg" className="mt-10" /> : !storageDeviceId ? (
                        <EmptyState icon={Box} title="Select a storage device" description="Choose a storage device to view conditions." />
                    ) : storageReadings.length === 0 ? (
                        <EmptyState icon={Box} title="No readings yet" description="No sensor data for this storage device." />
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Thermometer className="w-5 h-5 text-red-500" />{trend(storageLatest?.temperature, storagePrev?.temperature)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTemperature(storageLatest?.temperature)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Temperature</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Droplets className="w-5 h-5 text-blue-500" />{trend(storageLatest?.humidity, storagePrev?.humidity)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{storageLatest?.humidity ? `${storageLatest.humidity}%` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Humidity</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Bug className="w-5 h-5 text-purple-500" />{trend(storageLatest?.co2, storagePrev?.co2)}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{storageLatest?.co2 ? `${storageLatest.co2} ppm` : 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CO2 Level</p>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between mb-2"><Rat className="w-5 h-5 text-orange-500" />{storageLatest?.motion ? <span className="text-xs text-red-500 font-bold">🐀 Active</span> : <span className="text-xs text-green-500">Clear</span>}</div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{storageLatest?.motion ? 'Detected' : 'None'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Motion (Rats)</p>
                                </Card>
                            </div>

                            <Card title="Storage Reading History">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="px-4 py-3 text-left font-medium text-gray-500">Time</th><th className="px-4 py-3 text-left font-medium text-gray-500">Temp</th><th className="px-4 py-3 text-left font-medium text-gray-500">Humidity</th><th className="px-4 py-3 text-left font-medium text-gray-500">CO2</th><th className="px-4 py-3 text-left font-medium text-gray-500">Motion</th></tr></thead>
                                        <tbody>{storageReadings.map((r, i) => (<tr key={i} className="border-b border-gray-100 dark:border-gray-800"><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatDate(r.timestamp, 'time')}</td><td className="px-4 py-3">{formatTemperature(r.temperature)}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.humidity ? `${r.humidity}%` : 'N/A'}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.co2 ? `${r.co2} ppm` : 'N/A'}</td><td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.motion ? '🐀 Detected' : 'Clear'}</td></tr>))}</tbody>
                                    </table>
                                </div>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    );
}