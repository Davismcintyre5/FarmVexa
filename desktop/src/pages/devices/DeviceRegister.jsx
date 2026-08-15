import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getFarms } from '../../api/farms';
import { getFields } from '../../api/fields';
import { registerDevice } from '../../api/devices';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeviceRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ deviceId: '', farmId: '', fieldId: '', zone: 'field', sensorType: 'dht' });
    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { 
        getFarms().then((res) => setFarms(res.data.data.farms || [])); 
    }, []);

    const handleFarmChange = async (farmId) => {
        setForm((prev) => ({ ...prev, farmId, fieldId: '' }));
        if (farmId) {
            try {
                const res = await getFields(farmId);
                setFields(res.data.data.fields || []);
            } catch {
                setFields([]);
            }
        } else {
            setFields([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.deviceId || !form.farmId) return toast.error('Device ID and Farm are required');
        if (form.zone !== 'storage' && !form.fieldId) return toast.error('Field is required for non-storage devices');
        
        setLoading(true);
        try {
            await registerDevice(form.farmId, {
                deviceId: form.deviceId,
                zone: form.zone,
                sensorType: form.sensorType,
                field: form.zone === 'storage' ? null : form.fieldId,
            });
            toast.success('Device registered');
            navigate('/devices');
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Failed'); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to="/devices" className="flex items-center gap-2 text-gray-500">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Card title="Register Device">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Device ID" 
                        value={form.deviceId} 
                        onChange={(e) => setForm({ ...form, deviceId: e.target.value })} 
                        placeholder="ESP32_FIELD_01" 
                    />
                    
                    <Select 
                        label="Zone" 
                        value={form.zone} 
                        onChange={(e) => setForm({ ...form, zone: e.target.value, fieldId: '' })} 
                        options={[
                            { value: 'field', label: 'Field' },
                            { value: 'storage', label: 'Storage' },
                            { value: 'greenhouse', label: 'Greenhouse' },
                            { value: 'livestock', label: 'Livestock' },
                        ]} 
                    />
                    
                    <Select 
                        label="Sensor Type" 
                        value={form.sensorType} 
                        onChange={(e) => setForm({ ...form, sensorType: e.target.value })} 
                        options={[
                            { value: 'dht', label: 'DHT (Temp + Humidity)' },
                            { value: 'soil', label: 'Soil Moisture' },
                            { value: 'co2', label: 'CO2 (Insect Detection)' },
                            { value: 'pir', label: 'PIR (Motion Detection)' },
                            { value: 'acoustic', label: 'Acoustic (Pest Detection)' },
                            { value: 'camera', label: 'Camera' },
                            { value: 'weight', label: 'Weight' },
                        ]} 
                    />
                    
                    <Select 
                        label="Farm" 
                        value={form.farmId} 
                        onChange={(e) => handleFarmChange(e.target.value)} 
                        options={farms.map((f) => ({ value: f._id, label: f.name }))} 
                    />
                    
                    {form.zone !== 'storage' && (
                        <Select 
                            label="Field" 
                            value={form.fieldId} 
                            onChange={(e) => setForm({ ...form, fieldId: e.target.value })} 
                            options={fields.map((f) => ({ value: f._id, label: f.name }))} 
                            disabled={!form.farmId}
                        />
                    )}
                    
                    {form.zone === 'storage' && (
                        <p className="text-xs text-gray-400">
                            Storage devices don't require a field — they monitor storage conditions.
                        </p>
                    )}
                    
                    <Button type="submit" loading={loading} className="w-full">Register Device</Button>
                </form>
            </Card>
        </div>
    );
}