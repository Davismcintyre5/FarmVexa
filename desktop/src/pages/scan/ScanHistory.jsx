import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFieldImages } from '../../api/images';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft } from 'lucide-react';

export default function ScanHistory() {
    const { fieldId } = useParams();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { getFieldImages(fieldId).then((res) => setImages(res.data.data.images || [])).finally(() => setLoading(false)); }, [fieldId]);

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="page-container space-y-6">
            <Link to={`/fields/${fieldId}`} className="flex items-center gap-2 text-gray-500"><ArrowLeft className="w-4 h-4" /> Back</Link>
            <h1 className="text-2xl font-bold">Scan History</h1>
            {images.length === 0 ? <p className="text-gray-400">No scans yet</p> : (
                <div className="grid md:grid-cols-2 gap-4">
                    {images.map((img) => (
                        <Link key={img._id} to={`/scan/result/${img._id}`}>
                            <Card hover>
                                <img src={img.imageUrl} alt="Crop" className="w-full h-40 object-cover rounded-lg mb-3" />
                                <div className="flex justify-between items-center"><span className="font-medium">{img.diseaseDetected || 'Healthy'}</span><Badge status={img.severity || 'low'} /></div>
                                <p className="text-xs text-gray-400 mt-1">{formatDate(img.createdAt, 'relative')}</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}