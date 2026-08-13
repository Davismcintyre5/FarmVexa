import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFarm, updateFarm } from '../../api/farms';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmEdit() {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', county: '', subCounty: '', size: '', unit: 'acres' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getFarm(farmId).then((res) => {
            const f = res.data.data.farm;
            setForm({ name: f.name, county: f.location?.county || '', subCounty: f.location?.subCounty || '', size: f.size?.value || '', unit: f.size?.unit || 'acres' });
        }).finally(() => setLoading(false));
    }, [farmId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateFarm(farmId, { name: form.name, location: { county: form.county, subCounty: form.subCounty }, size: { value: Number(form.size), unit: form.unit } });
            toast.success('Farm updated');
            navigate(`/farms/${farmId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to={`/farms/${farmId}`} className="flex items-center gap-2 text-gray-500"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <Card title="Edit Farm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Farm Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="County" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} />
                        <Input label="Sub-County" value={form.subCounty} onChange={(e) => setForm({ ...form, subCounty: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Size" type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                        <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={[{ value: 'acres', label: 'Acres' }, { value: 'hectares', label: 'Hectares' }]} />
                    </div>
                    <Button type="submit" loading={saving} className="w-full">Save Changes</Button>
                </form>
            </Card>
        </div>
    );
}