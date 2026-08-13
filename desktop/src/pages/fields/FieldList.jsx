import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFields, deleteField } from '../../api/fields';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { Layers, Plus, Trash2 } from 'lucide-react';

export default function FieldList() {
    const { farmId } = useParams();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFields(farmId).then((res) => setFields(res.data.data.fields || [])).finally(() => setLoading(false));
    }, [farmId]);

    const handleDelete = async (id) => {
        if (!confirm('Delete field?')) return;
        await deleteField(id);
        setFields((prev) => prev.filter((f) => f._id !== id));
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fields</h1><p className="text-gray-500">{fields.length} field{fields.length !== 1 ? 's' : ''}</p></div>
                <Link to={`/farms/${farmId}/fields/new`}><Button><Plus className="w-4 h-4" /> Add Field</Button></Link>
            </div>
            {fields.length === 0 ? (
                <EmptyState icon={Layers} title="No fields" description="Add a field to this farm." actionLabel="Add Field" onAction={() => window.location.href = `/farms/${farmId}/fields/new`} />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fields.map((field) => (
                        <Link key={field._id} to={`/fields/${field._id}`}>
                            <Card hover>
                                <div className="flex justify-between"><h3 className="font-semibold">{field.name}</h3><Badge status={field.status} /></div>
                                <p className="text-sm text-gray-500 mt-1">{field.crop || 'No crop'}</p>
                                <p className="text-sm text-gray-500">{field.size?.value ? `${field.size.value} ${field.size.unit}` : ''}</p>
                                <div className="mt-3 pt-3 border-t flex justify-end">
                                    <button onClick={(e) => { e.preventDefault(); handleDelete(field._id); }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}