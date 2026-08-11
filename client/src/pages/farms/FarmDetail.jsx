import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFarm, deleteFarm } from '../../api/farms';
import { getFields } from '../../api/fields';
import { getFarmAlerts } from '../../api/alerts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { ArrowLeft, Plus, MapPin, Ruler, Layers, Bell, Trash2 } from 'lucide-react';

export default function FarmDetail() {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const [farm, setFarm] = useState(null);
    const [fields, setFields] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getFarm(farmId), getFields(farmId), getFarmAlerts(farmId)])
            .then(([f, fl, a]) => {
                setFarm(f.data.data.farm);
                setFields(fl.data.data.fields || []);
                setAlerts(a.data.data.alerts || []);
            })
            .finally(() => setLoading(false));
    }, [farmId]);

    const handleDelete = async () => {
        if (!confirm('Delete this farm and all fields?')) return;
        await deleteFarm(farmId);
        navigate('/farms');
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;
    if (!farm) return <EmptyState title="Farm not found" />;

    return (
        <div className="page-container space-y-6">
            <Link to="/farms" className="flex items-center gap-2 text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{farm.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {farm.location?.county}, {farm.location?.subCounty}</span>
                        <span className="flex items-center gap-1"><Ruler className="w-4 h-4" /> {farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : 'N/A'}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/farms/${farmId}/edit`}><Button variant="outline">Edit</Button></Link>
                    <Button variant="ghost" onClick={handleDelete} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                <Card><Layers className="w-6 h-6 text-primary-500 mb-2" /><p className="text-2xl font-bold">{fields.length}</p><p className="text-sm text-gray-500">Fields</p></Card>
                <Card><Bell className="w-6 h-6 text-red-500 mb-2" /><p className="text-2xl font-bold">{alerts.filter((a) => !a.isRead).length}</p><p className="text-sm text-gray-500">Active Alerts</p></Card>
                <Card><Badge status={farm.status} className="text-lg" /></Card>
            </div>
            <Card title="Fields" footer={<Link to={`/farms/${farmId}/fields/new`}><Button size="sm"><Plus className="w-3 h-3" /> Add Field</Button></Link>}>
                {fields.length === 0 ? <p className="text-gray-400 py-4 text-center">No fields yet</p> : (
                    <div className="space-y-2">
                        {fields.map((field) => (
                            <Link key={field._id} to={`/fields/${field._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div><p className="font-medium">{field.name}</p><p className="text-sm text-gray-500">{field.crop || 'No crop'}</p></div>
                                <Badge status={field.status} />
                            </Link>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}