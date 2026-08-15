import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ArrowLeft, Bug, Leaf, Shield, Droplets, Camera } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function FieldScanResult() {
    const { scanId } = useParams();
    const [scan, setScan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScan();
    }, [scanId]);

    const fetchScan = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/farm/field-scan/${scanId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setScan(res.data.data?.scan || res.data.scan);
        } catch (err) {
            console.error('Failed to fetch scan:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    if (!scan) return (
        <div className="text-center py-12 text-gray-400">
            <Leaf className="w-12 h-12 mx-auto mb-3" />
            <p>Scan not found</p>
        </div>
    );

    const summary = scan.summary || {};

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <Link to="/field-scan/history" className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <ArrowLeft className="w-4 h-4" /> Back to History
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Field Scan — {scan.field?.name || 'Unknown Field'}
            </h1>

            <Card>
                <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{new Date(scan.createdAt).toLocaleString('en-KE')}</span>
                        <span className="capitalize">{scan.cropType}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                            scan.status === 'completed' ? 'bg-green-100 text-green-700' : scan.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{scan.status}</span>
                    </div>

                    {/* Stats */}
                    <div className="text-xs text-gray-400 text-center">
                        📸 {scan.totalFrames} total | 🔍 {scan.analyzedFrames} analyzed | ⏭️ {scan.skippedFrames} skipped | 🤖 {scan.geminiRequests} Gemini reqs | ⏱ {scan.duration}s
                    </div>

                    {scan.skipReasons && Object.values(scan.skipReasons).some(v => v > 0) && (
                        <div className="text-xs text-gray-400">
                            Skip reasons: {Object.entries(scan.skipReasons).filter(([k, v]) => v > 0).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </div>
                    )}

                    {/* Summary cards */}
                    {scan.status === 'completed' && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                                <Bug className="w-6 h-6 mx-auto mb-2 text-red-600" />
                                <p className="text-2xl font-bold text-red-600">{summary.diseaseCount || 0}</p>
                                <p className="text-xs text-gray-500">Diseases</p>
                            </div>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
                                <Leaf className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                                <p className="text-2xl font-bold text-yellow-600">{summary.weeds?.hotspots?.length || 0}</p>
                                <p className="text-xs text-gray-500">Weed Spots</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
                                <p className="text-2xl font-bold text-green-600">{summary.healthyPercentage || 0}%</p>
                                <p className="text-xs text-gray-500">Healthy</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Diseases */}
            {summary.diseases?.length > 0 && (
                <Card>
                    <div className="space-y-3">
                        <p className="font-semibold">🦠 Diseases Detected</p>
                        {summary.diseases.map((d, i) => (
                            <div key={i} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <p className="font-semibold text-red-700">{d.name}</p>
                                <p className="text-xs text-gray-500">
                                    Severity: {d.severity} | 📍 {d.location?.lat?.toFixed(5)}, {d.location?.lng?.toFixed(5)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Photos grid */}
            {scan.photos?.length > 0 && (
                <Card>
                    <div className="space-y-3">
                        <p className="font-semibold">📸 Photos ({scan.photos.length})</p>
                        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                            {scan.photos.map((photo, i) => (
                                <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100">
                                    <img src={photo.imageUrl} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                        <p className="text-xs text-white truncate">
                                            {photo.analysis?.disease || 'Unknown'}
                                        </p>
                                        <p className="text-[10px] text-gray-300">
                                            {photo.analysis?.confidence || 0}% · {photo.analysis?.severity || 'low'}
                                        </p>
                                    </div>
                                    {photo.analysis?.weeds && (
                                        <span className="absolute top-1 right-1 text-yellow-400">🌿</span>
                                    )}
                                    {photo.analysis?.pests && (
                                        <span className="absolute top-1 left-1 text-red-400">🐛</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Recommendations */}
            {scan.photos?.some((p) => p.analysis?.recommendation) && (
                <Card>
                    <div className="space-y-3">
                        <p className="font-semibold flex items-center gap-2">
                            <Droplets className="w-4 h-4" /> Recommendations
                        </p>
                        {scan.photos
                            .filter((p) => p.analysis?.recommendation)
                            .slice(0, 5)
                            .map((p, i) => (
                                <div key={i} className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{p.analysis.recommendation}</p>
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            <Link to="/field-scan">
                <Button className="w-full"><Camera className="w-4 h-4" /> New Scan</Button>
            </Link>
        </div>
    );
}