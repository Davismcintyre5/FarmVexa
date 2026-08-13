import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getFarms } from '../../api/farms';
import { registerDevice } from '../../api/devices';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeviceRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ deviceId: '', farmId: '' });
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { getFarms().then((res) => setFarms(res.data.data.farms || [])); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.deviceId || !form.farmId) return toast.error('All fields required');
        setLoading(true);
        try {
            await registerDevice(form.farmId, { deviceId: form.deviceId });
            toast.success('Device registered');
            navigate('/devices');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to="/devices" className="flex items-center gap-2 text-gray-500"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <Card title="Register Device">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Device ID" value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} placeholder="ESP32_FIELD_01" />
                    <Select label="Farm" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value })} options={farms.map((f) => ({ value: f._id, label: f.name }))} />
                    <Button type="submit" loading={loading} className="w-full">Register Device</Button>
                </form>
            </Card>
        </div>
    );
}