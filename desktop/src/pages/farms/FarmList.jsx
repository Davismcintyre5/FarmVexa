import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFarms, getFarm } from '../../api/farms';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { Wheat, Plus, Trash2, MapPin } from 'lucide-react';

export default function FarmList() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((res) => setFarms(res.data.data.farms || [])).finally(() => setLoading(false));
        } else if (user?.farm) {
            getFarm(user.farm)
                .then((res) => setFarms([res.data.data.farm]))
                .catch(() => setFarms([]))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isFarmer, user]);

    const handleDelete = async (id) => { if (confirm('Delete farm?')) { await deleteFarm(id); setFarms((p) => p.filter((f) => f._id !== id)); } };

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container space-y-6">
            <div className="flex justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Farms</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{farms.length} farm{farms.length !== 1 ? 's' : ''}</p>
                </div>
                {isFarmer && <Link to="/farms/new"><Button><Plus className="w-4 h-4" /> Add Farm</Button></Link>}
            </div>

            {farms.length === 0 ? (
                <EmptyState icon={Wheat} title="No farms yet" description={isFarmer ? 'Create your first farm to get started.' : 'You are not assigned to any farm. Contact your administrator.'} actionLabel={isFarmer ? 'Create Farm' : undefined} onAction={isFarmer ? () => window.location.href = '/farms/new' : undefined} />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farms.map((farm) => (
                        <Link key={farm._id} to={`/farms/${farm._id}`}>
                            <Card hover className="h-full">
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{farm.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1"><MapPin className="w-3 h-3" />{farm.location?.county || 'N/A'}</div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{farm.size?.value ? `${farm.size.value} ${farm.size.unit}` : ''}</p>
                                    </div>
                                    <Badge status={farm.status} />
                                </div>
                                {isFarmer && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                        <button onClick={(e) => { e.preventDefault(); handleDelete(farm._id); }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}