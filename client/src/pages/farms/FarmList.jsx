import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFarms, deleteFarm } from '../../api/farms';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { Wheat, Plus, Trash2, MapPin } from 'lucide-react';

export default function FarmList() {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFarms().then((res) => setFarms(res.data.data.farms || [])).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this farm?')) return;
        await deleteFarm(id);
        setFarms((prev) => prev.filter((f) => f._id !== id));
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Farms</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{farms.length} farm{farms.length !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/farms/new"><Button><Plus className="w-4 h-4" /> Add Farm</Button></Link>
            </div>
            {farms.length === 0 ? (
                <EmptyState icon={Wheat} title="No farms yet" description="Create your first farm to get started." actionLabel="Create Farm" onAction={() => window.location.href = '/farms/new'} />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farms.map((farm) => (
                        <Link key={farm._id} to={`/farms/${farm._id}`}>
                            <Card hover className="h-full">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{farm.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {farm.location?.county || 'No location'}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {farm.size?.value ? `${farm.size.value} ${farm.size.unit || 'acres'}` : 'Size not set'}
                                        </p>
                                    </div>
                                    <Badge status={farm.status} />
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                    <button onClick={(e) => { e.preventDefault(); handleDelete(farm._id); }} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}