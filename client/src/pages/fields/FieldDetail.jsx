import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getField, deleteField } from '../../api/fields';
import { getFieldReadings } from '../../api/sensors';
import { getFieldImages } from '../../api/images';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatTemperature } from '../../utils/formatters';
import { ArrowLeft, Camera, Thermometer, Droplets, Sun, Trash2, Edit3 } from 'lucide-react';

export default function FieldDetail() {
    const { fieldId } = useParams();
    const navigate = useNavigate();
    const [field, setField] = useState(null);
    const [readings, setReadings] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getField(fieldId),
            getFieldReadings(fieldId, 1),
            getFieldImages(fieldId),
        ]).then(([f, r, i]) => {
            setField(f.data.data.field);
            setReadings(r.data.data.readings || []);
            setImages(i.data.data.images || []);
        }).finally(() => setLoading(false));
    }, [fieldId]);

    const handleDelete = async () => {
        if (!confirm('Delete this field?')) return;
        await deleteField(fieldId);
        navigate(`/farms/${field?.farm?._id}/fields`);
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;
    if (!field) return <EmptyState title="Field not found" />;

    const latest = readings[0];

    return (
        <div className="page-container space-y-6">
            <Link to={`/farms/${field.farm?._id}/fields`} className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <ArrowLeft className="w-4 h-4" /> Back to Fields
            </Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{field.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{field.crop || 'No crop'} · {field.soilType || 'Unknown soil'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge status={field.status} />
                    <Link to={`/fields/${fieldId}/edit`}><Button variant="outline" size="sm"><Edit3 className="w-3 h-3" /></Button></Link>
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                </div>
            </div>

            {latest && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><Thermometer className="w-5 h-5 text-red-500 mb-1" /><p className="text-xl font-bold">{formatTemperature(latest.temperature)}</p><p className="text-xs text-gray-400">Temperature</p></Card>
                    <Card><Droplets className="w-5 h-5 text-blue-500 mb-1" /><p className="text-xl font-bold">{latest.humidity ? `${latest.humidity}%` : 'N/A'}</p><p className="text-xs text-gray-400">Humidity</p></Card>
                    <Card><Droplets className="w-5 h-5 text-green-500 mb-1" /><p className="text-xl font-bold">{latest.soilMoisture ? `${latest.soilMoisture}%` : 'N/A'}</p><p className="text-xs text-gray-400">Soil Moisture</p></Card>
                    <Card><Sun className="w-5 h-5 text-yellow-500 mb-1" /><p className="text-xl font-bold">{latest.lightLevel || 'N/A'}</p><p className="text-xs text-gray-400">Light</p></Card>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                <Card title="Crop Scans" footer={<Link to="/scan"><Button size="sm"><Camera className="w-3 h-3" /> Scan Crop</Button></Link>}>
                    {images.length === 0 ? <p className="text-gray-400 py-4 text-center text-sm">No scans yet</p> : (
                        <div className="space-y-2">
                            {images.slice(0, 5).map((img) => (
                                <Link key={img._id} to={`/scan/result/${img._id}`} className="flex justify-between py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <span className="text-sm">{img.diseaseDetected || 'Healthy'}</span>
                                    <span className="text-xs text-gray-400">{formatDate(img.createdAt, 'relative')}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title="Quick Actions">
                    <div className="space-y-2">
                        <Link to={`/fields/${fieldId}/edit`}><Button variant="outline" className="w-full">Edit Field</Button></Link>
                        <Link to={`/fields/${fieldId}/sensors`}><Button variant="outline" className="w-full">View Sensor Data</Button></Link>
                        <Link to={`/fields/${fieldId}/scans`}><Button variant="outline" className="w-full">Scan History</Button></Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}