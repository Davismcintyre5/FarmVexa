import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getField, updateField } from '../../api/fields';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FieldEdit() {
    const { fieldId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', crop: '', size: '', unit: 'acres', soilType: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getField(fieldId).then((res) => {
            const f = res.data.data.field;
            setForm({ name: f.name, crop: f.crop || '', size: f.size?.value || '', unit: f.size?.unit || 'acres', soilType: f.soilType || '' });
        }).finally(() => setLoading(false));
    }, [fieldId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateField(fieldId, { name: form.name, crop: form.crop, size: { value: Number(form.size), unit: form.unit }, soilType: form.soilType });
            toast.success('Updated');
            navigate(`/fields/${fieldId}`);
        } catch (err) { toast.error('Failed'); } finally { setSaving(false); }
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to={`/fields/${fieldId}`} className="flex items-center gap-2 text-gray-500"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <Card title="Edit Field">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Input label="Crop" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Size" type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                        <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={[{ value: 'acres', label: 'Acres' }, { value: 'hectares', label: 'Hectares' }]} />
                    </div>
                    <Input label="Soil Type" value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })} />
                    <Button type="submit" loading={saving} className="w-full">Save</Button>
                </form>
            </Card>
        </div>
    );
}