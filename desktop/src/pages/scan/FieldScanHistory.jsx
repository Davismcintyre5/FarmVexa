import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { Camera, Leaf, Bug, Shield, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function FieldScanHistory() {
    const { user } = useAuth();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchScans();
    }, []);

    const fetchScans = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/farm/field-scan/my-scans`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setScans(res.data.data?.scans || []);
        } catch (err) {
            toast.error('Failed to load scans');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (scanId) => {
        if (!confirm('Delete this scan?')) return;
        setDeleting(scanId);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/farm/field-scan/${scanId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Scan deleted');
            fetchScans();
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Field Scan History</h1>
                <Link to="/field-scan">
                    <Button size="sm"><Camera className="w-4 h-4" /> New Scan</Button>
                </Link>
            </div>

            {scans.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500">No field scans yet</p>
                        <Link to="/field-scan" className="text-primary-500 text-sm mt-2 inline-block">
                            Start your first scan →
                        </Link>
                    </div>
                </Card>
            ) : (
                scans.map((scan) => (
                    <Card key={scan._id}>
                        <Link to={`/field-scan/${scan._id}`}>
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {scan.field?.name || 'Unknown Field'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(scan.createdAt).toLocaleString('en-KE')}
                                        </p>
                                        <p className="text-xs text-gray-400 capitalize">{scan.cropType}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            scan.status === 'completed' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : scan.status === 'failed'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}>
                                            {scan.status}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                {scan.status === 'completed' && scan.summary && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                                            <Bug className="w-4 h-4 mx-auto mb-1 text-red-600" />
                                            <p className="text-lg font-bold text-red-600">{scan.summary.diseaseCount || 0}</p>
                                            <p className="text-xs text-gray-500">Diseases</p>
                                        </div>
                                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                                            <Leaf className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
                                            <p className="text-lg font-bold text-yellow-600">{scan.summary.weeds?.hotspots?.length || 0}</p>
                                            <p className="text-xs text-gray-500">Weeds</p>
                                        </div>
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                            <Shield className="w-4 h-4 mx-auto mb-1 text-green-600" />
                                            <p className="text-lg font-bold text-green-600">{scan.summary.healthyPercentage || 0}%</p>
                                            <p className="text-xs text-gray-500">Healthy</p>
                                        </div>
                                    </div>
                                )}

                                <div className="text-xs text-gray-400">
                                    📸 {scan.totalFrames || 0} total | 🔍 {scan.analyzedFrames || 0} analyzed | ⏭️ {scan.skippedFrames || 0} skipped
                                    {scan.duration ? ` | ⏱ ${scan.duration}s` : ''}
                                </div>
                            </div>
                        </Link>

                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => handleDelete(scan._id)}
                                disabled={deleting === scan._id}
                                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                                {deleting === scan._id ? 'Deleting...' : '🗑 Delete'}
                            </button>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
}