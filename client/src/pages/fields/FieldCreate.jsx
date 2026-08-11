import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createField } from '../../api/fields';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FieldCreate() {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', crop: '', size: '', unit: 'acres', soilType: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) return toast.error('Field name required');
        setLoading(true);
        try {
            await createField(farmId, { name: form.name, crop: form.crop, size: { value: Number(form.size), unit: form.unit }, soilType: form.soilType });
            toast.success('Field created');
            navigate(`/farms/${farmId}/fields`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to={`/farms/${farmId}/fields`} className="flex items-center gap-2 text-gray-500"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <Card title="Add Field">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Field Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tomato Field" />
                    <Input label="Crop" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} placeholder="Tomato" />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Size" type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                        <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={[{ value: 'acres', label: 'Acres' }, { value: 'hectares', label: 'Hectares' }]} />
                    </div>
                    <Input label="Soil Type" value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })} placeholder="Loam" />
                    <Button type="submit" loading={loading} className="w-full">Create Field</Button>
                </form>
            </Card>
        </div>
    );
}