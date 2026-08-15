import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { uploadImage } from '../../api/images';
import { getFarms } from '../../api/farms';
import { getFields } from '../../api/fields';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ExternalCamera from '../../components/public/ExternalCamera';
import { Camera, Upload, X, ImagePlus, Check, History, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CropScan() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const fileRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [farmId, setFarmId] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [cropType, setCropType] = useState('');
    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [farmsLoaded, setFarmsLoaded] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [allowExternalCamera, setAllowExternalCamera] = useState(false);
    const [externalCameraInUrl, setExternalCameraInUrl] = useState('');
    const [externalCameraOutUrl, setExternalCameraOutUrl] = useState('');
    const [showExternalCamera, setShowExternalCamera] = useState(false);
    const [receivingPhoto, setReceivingPhoto] = useState(false);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => {
                setAllowExternalCamera(res.data.data?.allowExternalCamera || false);
                setExternalCameraInUrl(res.data.data?.externalCameraInUrl || '');
                setExternalCameraOutUrl(res.data.data?.externalCameraOutUrl || '');
            })
            .catch(() => {});

        if (!isFarmer && user?.farm) {
            setFarmId(user.farm);
            setFarms([{ _id: user.farm, name: 'Assigned Farm' }]);
            setFarmsLoaded(true);
            getFields(user.farm).then((res) => setFields(res.data.data.fields || [])).catch(() => {});
        }
    }, [user]);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((res) => {
                setFarms(res.data.data.farms || []);
                setFarmsLoaded(true);
            });
        }
    }, [isFarmer]);

    // Message listener for hdmstream postMessage
    useEffect(() => {
        const handler = (event) => {
            // Check message type
            if (event.data?.type === 'farmvexa-crop-photo') {
                const imageUrl = event.data.imageUrl;
                
                if (!imageUrl) {
                    toast.error('No image URL received');
                    return;
                }

                // Validate URL (optional: check for Cloudinary domain)
                // if (!imageUrl.includes('cloudinary.com')) {
                //     toast.error('Invalid image source');
                //     return;
                // }

                setReceivingPhoto(true);
                
                // Fetch the image from Cloudinary
                fetch(imageUrl)
                    .then((res) => {
                        if (!res.ok) throw new Error('Failed to fetch image');
                        return res.blob();
                    })
                    .then((blob) => {
                        // Check file size (max 10MB)
                        if (blob.size > 10 * 1024 * 1024) {
                            throw new Error('Image too large (max 10MB)');
                        }

                        // Convert blob to File
                        const file = new File([blob], `external-${Date.now()}.jpg`, { 
                            type: blob.type || 'image/jpeg' 
                        });
                        
                        // Set in FarmVexa Crop Scan
                        setFile(file);
                        setPreview(URL.createObjectURL(blob));
                        
                        // Close the external camera modal
                        setShowExternalCamera(false);
                        
                        // Stop local camera if running
                        stopCamera();
                        
                        toast.success('Photo received! Click Upload & Analyze.');
                    })
                    .catch((err) => {
                        console.error('Failed to receive photo:', err);
                        toast.error(err.message || 'Failed to receive photo from external camera');
                    })
                    .finally(() => {
                        setReceivingPhoto(false);
                    });
            }
        };
        
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    useEffect(() => {
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, []);

    const handleFarmChange = async (id) => {
        setFarmId(id);
        setFieldId('');
        if (id) {
            const res = await getFields(id);
            setFields(res.data.data.fields || []);
        }
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (f) { setFile(f); setPreview(URL.createObjectURL(f)); stopCamera(); }
    };

    const clearFile = () => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; };

    const stopCamera = () => {
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraOn(false);
    };

    const startCamera = async () => {
        setCameraError('');
        setFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        setCameraOn(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
            });
            streamRef.current = stream;
            setCameraOn(true);
            setTimeout(() => {
                if (videoRef.current && streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                    videoRef.current.play().catch(() => {});
                }
            }, 100);
        } catch (err) {
            const msg = err.name === 'NotAllowedError' ? 'Camera permission denied.' : err.name === 'NotFoundError' ? 'No camera found.' : err.message;
            setCameraError(msg);
            toast.error(msg);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (!blob) return toast.error('Failed to capture');
            const f = new File([blob], `crop_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFile(f);
            setPreview(URL.createObjectURL(blob));
            stopCamera();
        }, 'image/jpeg', 0.9);
    };

    const handleUpload = async () => {
        if (!file) return toast.error('Please select or capture an image');
        if (!fieldId) return toast.error('Please select a field');
        if (!cropType) return toast.error('Please select crop type');
        setLoading(true);
        const formData = new FormData();
        formData.append('cropImage', file);
        formData.append('fieldId', fieldId);
        formData.append('cropType', cropType);
        try {
            const res = await uploadImage(formData);
            toast.success('Analysis complete!');
            navigate(`/scan/result/${res.data.data.cropImage._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container max-w-lg mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scan Crop</h1>
                {fieldId && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/fields/${fieldId}/scans`)}>
                        <History className="w-4 h-4" /> History
                    </Button>
                )}
            </div>

            <Card>
                <div className="space-y-4">
                    {isFarmer ? (
                        <>
                            {farmsLoaded && (
                                <Select label="Farm" value={farmId} onChange={(e) => handleFarmChange(e.target.value)}
                                    options={farms.map((f) => ({ value: f._id, label: f.name }))} />
                            )}
                            <Select label="Field" value={fieldId} onChange={(e) => setFieldId(e.target.value)}
                                options={fields.map((f) => ({ value: f._id, label: f.name }))} />
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>
                            <Select label="Field" value={fieldId} onChange={(e) => setFieldId(e.target.value)}
                                options={fields.map((f) => ({ value: f._id, label: f.name }))} />
                        </>
                    )}
                    <Select label="Crop Type" value={cropType} onChange={(e) => setCropType(e.target.value)}
                        options={[
                            { value: 'tomato', label: 'Tomato' }, { value: 'maize', label: 'Maize' },
                            { value: 'potato', label: 'Potato' }, { value: 'bean', label: 'Bean' },
                            { value: 'cassava', label: 'Cassava' }, { value: 'coffee', label: 'Coffee' },
                            { value: 'tea', label: 'Tea' }, { value: 'wheat', label: 'Wheat' },
                            { value: 'rice', label: 'Rice' },
                        ]} />
                </div>
            </Card>

            <Card>
                {cameraOn ? (
                    <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden bg-black">
                            <video key={cameraOn ? 'on' : 'off'} ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                            <button onClick={stopCamera} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <Button onClick={capturePhoto} className="w-full"><Check className="w-4 h-4" /> Capture Photo</Button>
                    </div>
                ) : preview ? (
                    <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden">
                            <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                            <button onClick={clearFile} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="truncate">{file?.name}</span>
                            <span>{(file?.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={clearFile} className="flex-1">Remove</Button>
                            <Button variant="outline" onClick={() => fileRef.current?.click()} className="flex-1">Change</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-primary-500 transition-colors">
                            <ImagePlus className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Tap to select image</p>
                            <p className="text-sm text-gray-400 mt-1">JPG, PNG or WEBP (max 10MB)</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => fileRef.current?.click()} className="flex-1">
                                <Upload className="w-4 h-4" /> Gallery
                            </Button>
                            <Button variant="outline" onClick={startCamera} className="flex-1">
                                <Camera className="w-4 h-4" /> Camera
                            </Button>
                            {allowExternalCamera && (
                                <Button variant="outline" onClick={() => setShowExternalCamera(true)} className="flex-1">
                                    <Video className="w-4 h-4" /> External
                                </Button>
                            )}
                        </div>
                        {cameraError && <p className="text-sm text-red-500 text-center">{cameraError}</p>}
                    </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </Card>

            {/* External Camera Modal */}
            <Modal open={showExternalCamera} onClose={() => setShowExternalCamera(false)} title="📹 External Camera Stream" size="xl">
                <ExternalCamera
                    inUrl={externalCameraInUrl}
                    outUrl={externalCameraOutUrl}
                    title="Crop Scan Camera"
                />
                {receivingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                            <p className="text-white">Receiving photo...</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Button onClick={handleUpload} loading={loading} disabled={!file || !fieldId || !cropType} className="w-full" size="lg">
                {loading ? 'Analyzing...' : 'Upload & Analyze Crop'}
            </Button>
        </div>
    );
}