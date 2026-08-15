import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getFarms } from '../../api/farms';
import { getFields } from '../../api/fields';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ExternalCamera from '../../components/public/ExternalCamera';
import { Video, Loader2, History } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const processingMessages = [
    '📸 Uploading photos...',
    '🔍 Pre-filtering frames...',
    '🧠 Analyzing with AI...',
    '🦠 Detecting diseases...',
    '🌿 Checking for weeds...',
    '🐛 Scanning for pests...',
    '📊 Building results...',
    '✅ Almost done...',
];

export default function FieldScan() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [cropType, setCropType] = useState('');
    const [settings, setSettings] = useState(null);
    const [showExternalCamera, setShowExternalCamera] = useState(false);
    const [externalCameraInUrl, setExternalCameraInUrl] = useState('');
    const [externalCameraOutUrl, setExternalCameraOutUrl] = useState('');
    const [supportPhone, setSupportPhone] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [processingText, setProcessingText] = useState(0);
    const [settingsLoading, setSettingsLoading] = useState(true);

    // Rotate processing messages
    useEffect(() => {
        if (!processing) return;
        
        const interval = setInterval(() => {
            setProcessingText((prev) => (prev + 1) % processingMessages.length);
        }, 8000);
        
        return () => clearInterval(interval);
    }, [processing]);

    useEffect(() => {
        // Fetch public settings for external camera URLs + contacts
        axios.get(`${API_BASE}/admin/public/settings`)
            .then((res) => {
                const data = res.data.data || res.data;
                setExternalCameraInUrl(data.externalCameraInUrl || '');
                setExternalCameraOutUrl(data.externalCameraOutUrl || '');
                setSupportPhone(data.supportPhone || '+254700000000');
                setWhatsappNumber(data.whatsappNumber || '');
            })
            .catch(() => {});

        // Fetch field scan settings
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE}/farm/field-scan/settings`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setSettings(res.data.data || res.data))
            .catch(() => toast.error('Field scan is not available'))
            .finally(() => setSettingsLoading(false));

        // Fetch farms
        if (isFarmer) {
            getFarms().then((res) => setFarms(res.data.data.farms || [])).catch(() => {});
        } else if (user?.farm) {
            setFarmId(user.farm);
            getFields(user.farm).then((res) => setFields(res.data.data.fields || [])).catch(() => {});
        }
    }, [user]);

    // Listen for batch of photos from hdmstream — auto-analyze
    useEffect(() => {
        const handler = (event) => {
            // Handle batch send from hdmstream field scan
            if (event.data?.type === 'farmvexa-field-scan-batch') {
                const photos = event.data.photos || [];
                if (photos.length === 0) return;

                setShowExternalCamera(false);
                toast.success(`Received ${photos.length} photos — analyzing automatically...`);
                
                autoAnalyze(photos);
            }

            // Handle single photo (backward compatibility)
            if (event.data?.type === 'farmvexa-crop-photo') {
                const imageUrl = event.data.imageUrl;
                if (!imageUrl) return;

                setShowExternalCamera(false);
                toast.success('Photo received — analyzing...');
                
                autoAnalyze([{ 
                    imageUrl, 
                    lat: event.data.lat, 
                    lng: event.data.lng, 
                    timestamp: event.data.timestamp || new Date().toISOString() 
                }]);
            }
        };

        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [fieldId, cropType, settings]);

    const autoAnalyze = async (photos) => {
        if (!fieldId) {
            toast.error('Select a field first');
            return;
        }
        if (!cropType) {
            toast.error('Select crop type first');
            return;
        }

        setProcessing(true);
        setProcessingText(0);

        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(
                `${API_BASE}/farm/field-scan/analyze`,
                {
                    fieldId,
                    cropType,
                    frames: photos,
                    maxGeminiCalls: settings?.maxGeminiCallsPerScan || 30,
                    preFilterEnabled: settings?.preFilterEnabled ?? true,
                    preFilterPercentage: settings?.preFilterPercentage || 60,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const scanId = res.data.data?.scanId || res.data.scanId;
            toast.success('Field scan complete');
            
            // Redirect to results page
            if (scanId) {
                navigate(`/field-scan/${scanId}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Field scan failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleFarmChange = async (id) => {
        setFarmId(id);
        setFieldId('');
        const res = await getFields(id);
        setFields(res.data.data.fields || []);
    };

    // Full-page disabled state
    if (!settingsLoading && settings && !settings.enabled) {
        return (
            <div className="page-container max-w-lg mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Field Scan</h1>
                    <Button variant="outline" size="sm" onClick={() => navigate('/field-scan/history')}>
                        <History className="w-4 h-4" /> History
                    </Button>
                </div>

                <div className="text-center py-16">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Field Scan is currently disabled</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                        The field scan feature has been temporarily disabled by the administrator.
                        Please check back later.
                    </p>
                    {supportPhone && (
                        <p className="text-sm text-gray-400 mt-4">
                            For urgent matters, contact support:{' '}
                            <a href={`tel:${supportPhone}`} className="text-primary-500 hover:underline">
                                {supportPhone}
                            </a>
                        </p>
                    )}
                    {whatsappNumber && (
                        <a 
                            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-sm text-green-600 hover:underline"
                        >
                            💬 WhatsApp Support
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Field Scan</h1>
                <Button variant="outline" size="sm" onClick={() => navigate('/field-scan/history')}>
                    <History className="w-4 h-4" /> History
                </Button>
            </div>

            {/* Processing overlay */}
            {processing && (
                <Card>
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                        
                        {/* Dynamic text */}
                        <p className="text-gray-600 dark:text-gray-400 font-medium transition-all duration-500">
                            {processingMessages[processingText]}
                        </p>
                        
                        {/* Progress dots */}
                        <div className="flex gap-1 mt-3">
                            {processingMessages.map((_, i) => (
                                <span
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                        i === processingText 
                                            ? 'bg-primary-500 scale-125' 
                                            : i < processingText 
                                            ? 'bg-primary-300' 
                                            : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-4">
                            This takes less than 5 minutes — please stay on this page
                        </p>
                        
                        {/* Progress bar */}
                        <div className="w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs overflow-hidden">
                            <div 
                                className="h-2 rounded-full bg-primary-500 transition-all duration-1000"
                                style={{ width: `${((processingText + 1) / processingMessages.length) * 100}%` }}
                            />
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-2">
                            {Math.round(((processingText + 1) / processingMessages.length) * 100)}%
                        </p>
                    </div>
                </Card>
            )}

            {/* Setup */}
            {!processing && (
                <>
                    <Card>
                        <div className="space-y-4">
                            {isFarmer ? (
                                <>
                                    <Select label="Farm" value={farmId} onChange={(e) => handleFarmChange(e.target.value)}
                                        options={farms.map((f) => ({ value: f._id, label: f.name }))} />
                                    <Select label="Field" value={fieldId} onChange={(e) => setFieldId(e.target.value)}
                                        options={fields.map((f) => ({ value: f._id, label: f.name }))} />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium">📍 {farms[0]?.name || 'Assigned Farm'}</p>
                                    <Select label="Field" value={fieldId} onChange={(e) => setFieldId(e.target.value)}
                                        options={fields.map((f) => ({ value: f._id, label: f.name }))} />
                                </>
                            )}
                            <Select label="Crop Type" value={cropType} onChange={(e) => setCropType(e.target.value)}
                                options={(settings?.allowedCropTypes || ['tomato', 'vegetable', 'maize', 'potato', 'bean', 'cassava', 'coffee', 'tea', 'wheat', 'rice', 'other']).map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
                        </div>
                    </Card>

                    <Card>
                        <div className="space-y-3">
                            <Button 
                                onClick={() => setShowExternalCamera(true)} 
                                disabled={!settings?.enabled}
                                className="w-full" 
                                size="lg"
                            >
                                <Video className="w-4 h-4" /> Open External Camera
                            </Button>
                            <p className="text-xs text-gray-400 text-center">
                                Opens hdmstream. Start field scan from the hdmstream /out page.
                            </p>
                        </div>
                    </Card>
                </>
            )}

            {/* External Camera Modal */}
            <Modal open={showExternalCamera} onClose={() => setShowExternalCamera(false)} title="📹 External Camera" size="xl">
                <ExternalCamera
                    inUrl={externalCameraInUrl}
                    outUrl={externalCameraOutUrl}
                    title="Field Scan Camera"
                />
            </Modal>
        </div>
    );
}