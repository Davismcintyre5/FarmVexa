import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createFarm } from '../../api/farms';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmCreate() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', county: '', subCounty: '', size: '', unit: 'acres' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) return toast.error('Farm name is required');
        setLoading(true);
        try {
            await createFarm({
                name: form.name,
                location: { county: form.county, subCounty: form.subCounty },
                size: form.size ? { value: Number(form.size), unit: form.unit } : undefined,
            });
            toast.success('Farm created');
            navigate('/farms');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to="/farms" className="flex items-center gap-2 text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <Card title="Create Farm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Farm Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Green Acres" />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} placeholder="Kiambu" />
                        <Input label="Sub-County" value={form.subCounty} onChange={(e) => setForm({ ...form, subCounty: e.target.value })} placeholder="Limuru" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Size" type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="5" />
                        <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={[{ value: 'acres', label: 'Acres' }, { value: 'hectares', label: 'Hectares' }]} />
                    </div>
                    <Button type="submit" loading={loading} className="w-full">Create Farm</Button>
                </form>
            </Card>
        </div>
    );
}