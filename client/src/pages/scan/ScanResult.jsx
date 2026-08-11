import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getImage } from '../../api/images';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ArrowLeft, Camera, Leaf, AlertTriangle, Shield, Droplets } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getFullUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}/${url}`;
}

export default function ScanResult() {
    const { imageId } = useParams();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getImage(imageId).then((res) => setImage(res.data.data.image)).finally(() => setLoading(false));
    }, [imageId]);

    if (loading) return <Spinner size="lg" className="mt-20" />;
    if (!image) return (
        <div className="text-center py-12 text-gray-400">
            <Leaf className="w-12 h-12 mx-auto mb-3" />
            <p>Image not found</p>
        </div>
    );

    const isHealthy = image.diseaseDetected === 'Healthy';
    const severityColor = {
        low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
        high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to="/scan" className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <Card>
                <img
                    src={getFullUrl(image.imageUrl)}
                    alt="Crop scan"
                    className="w-full rounded-xl mb-4 max-h-80 object-cover bg-gray-100 dark:bg-gray-800"
                    onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23ddd"><rect width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">Image</text></svg>'; }}
                />

                <div className="space-y-4">
                    {/* Status Banner */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${isHealthy ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                        {isHealthy ? (
                            <Shield className="w-8 h-8 text-green-600" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        )}
                        <div>
                            <p className={`text-lg font-bold ${isHealthy ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                {isHealthy ? 'Crop is Healthy' : 'Disease Detected'}
                            </p>
                            <p className={`text-sm font-medium ${isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {isHealthy ? 'No issues found' : image.diseaseDetected}
                            </p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Disease</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{image.diseaseDetected || 'Unknown'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Severity</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${severityColor[image.severity] || severityColor.low}`}>
                                {image.severity?.charAt(0).toUpperCase() + image.severity?.slice(1) || 'Low'}
                            </span>
                        </div>
                        {image.cropType && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Crop</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{image.cropType}</p>
                            </div>
                        )}
                        {image.confidence && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{image.confidence}%</p>
                            </div>
                        )}
                    </div>

                    {/* Symptoms */}
                    {image.symptoms && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Droplets className="w-4 h-4" /> Symptoms
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{image.symptoms}</p>
                        </div>
                    )}

                    {/* Recommendation */}
                    {image.recommendation && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-200 dark:border-primary-800">
                            <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-1">
                                💡 Recommendation
                            </p>
                            <p className="text-primary-600 dark:text-primary-400 text-sm leading-relaxed">
                                {image.recommendation}
                            </p>
                        </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 text-right">
                        Scanned {new Date(image.createdAt).toLocaleString('en-KE')}
                    </p>
                </div>
            </Card>

            <Link to="/scan">
                <Button className="w-full"><Camera className="w-4 h-4" /> New Scan</Button>
            </Link>
        </div>
    );
}