import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getFields } from '../../api/fields';
import { getFieldReadings } from '../../api/sensors';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Activity, Thermometer, Droplets, Sun, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDate, formatTemperature } from '../../utils/formatters';

export default function SensorReadings() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [farmsLoaded, setFarmsLoaded] = useState(false);

    useEffect(() => {
        if (!isFarmer && user?.farm) {
            setFarmId(user.farm);
            setFarms([{ _id: user.farm, name: 'Assigned Farm' }]);
            setFarmsLoaded(true);
            getFields(user.farm).then((res) => setFields(res.data.data.fields || [])).catch(() => {});
        }
    }, [user]);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((res) => {
                setFarms(res.data.data.farms || []);
                setFarmsLoaded(true);
            });
        }
    }, [isFarmer]);

    useEffect(() => {
        if (fieldId) {
            setLoading(true);
            getFieldReadings(fieldId, 50).then((res) => setReadings(res.data.data.readings || [])).finally(() => setLoading(false));
        }
    }, [fieldId]);

    const handleFarmChange = async (id) => {
        setFarmId(id); setFieldId(''); setReadings([]);
        if (id) { const res = await getFields(id); setFields(res.data.data.fields || []); }
    };

    const latest = readings[0];
    const prev = readings[1];

    const trend = (curr, prev) => {
        if (!curr || !prev) return null;
        if (curr > prev) return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (curr < prev) return <TrendingDown className="w-4 h-4 text-green-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="page-container space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sensor Readings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor your field conditions in real-time</p>
            </div>

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
        </div>
    );
}