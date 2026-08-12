import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFarm, deleteFarm } from '../../api/farms';
import { getFields } from '../../api/fields';
import { getFarmAlerts } from '../../api/alerts';
import { getAnimals } from '../../api/animals';
import { getStock } from '../../api/stock';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { ArrowLeft, Plus, MapPin, Ruler, Layers, Bell, Trash2, Edit3, GitBranch, Package } from 'lucide-react';

export default function FarmDetail() {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farm, setFarm] = useState(null);
    const [fields, setFields] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [animalCount, setAnimalCount] = useState(0);
    const [stockValue, setStockValue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getFarm(farmId), getFields(farmId), getFarmAlerts(farmId), getAnimals(farmId), getStock(farmId)])
            .then(([f, fl, a, an, st]) => {
                setFarm(f.data.data.farm);
                setFields(fl.data.data.fields || []);
                setAlerts(a.data.data.alerts || []);
                setAnimalCount((an.data.data.animals || []).length);
                const items = st.data.data.items || [];
                setStockValue(items.reduce((s, i) => s + (i.quantity || 0) * (i.pricePerUnit || 0), 0));
            })
            .finally(() => setLoading(false));
    }, [farmId]);

    const handleDelete = async () => { if (confirm('Delete farm?')) { await deleteFarm(farmId); navigate('/farms'); } };

    if (loading) return <Spinner size="lg" className="mt-20" />;
    if (!farm) return <EmptyState title="Farm not found" />;

    return (
        <div className="page-container space-y-6">
            <Link to="/farms" className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><ArrowLeft className="w-4 h-4" /> Back</Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{farm.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{farm.location?.county}, {farm.location?.subCounty}</span>
                        <span className="flex items-center gap-1"><Ruler className="w-4 h-4" />{farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : 'N/A'}</span>
                    </div>
                </div>
                {isFarmer && (
                    <div className="flex gap-2">
                        <Link to={`/farms/${farmId}/edit`}><Button variant="outline" size="sm"><Edit3 className="w-3 h-3" /></Button></Link>
                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                    <Layers className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{fields.length}</p>
                    <p className="text-sm text-gray-500">Fields</p>
                </Card>
                <Card className="text-center">
                    <GitBranch className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{animalCount}</p>
                    <p className="text-sm text-gray-500">Animals</p>
                </Card>
                <Card className="text-center">
                    <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">KES {stockValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Stock Value</p>
                </Card>
                <Card className="text-center">
                    <Bell className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{alerts.filter((a) => !a.isRead).length}</p>
                    <p className="text-sm text-gray-500">Alerts</p>
                </Card>
                <Card className="text-center flex items-center justify-center">
                    <Badge status={farm.status} className="text-lg" />
                </Card>
            </div>

            <Card title="Fields" footer={isFarmer ? <Link to={`/farms/${farmId}/fields/new`}><Button size="sm"><Plus className="w-3 h-3" /> Add Field</Button></Link> : null}>
                {fields.length === 0 ? <p className="text-gray-400 py-4 text-center text-sm">No fields yet</p> : (
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