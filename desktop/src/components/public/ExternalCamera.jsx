import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Video, Camera, ExternalLink, RefreshCw } from 'lucide-react';

export default function ExternalCamera({ inUrl, outUrl, title = 'External Camera' }) {
    const [showStream, setShowStream] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [isElectron, setIsElectron] = useState(false);
    const webviewRef = useRef(null);

    useEffect(() => {
        setIsElectron(window.electronAPI?.isElectron || false);
    }, []);

    // Listen for IPC messages from webview (hdmstream in Electron)
    useEffect(() => {
        if (!window.electronAPI?.onMessage) return;

        const unsubscribe = window.electronAPI.onMessage((data) => {
            if (!data) return;

            // Forward as postMessage so FieldScan.jsx can receive it
            window.postMessage({
                type: data.type || 'farmvexa-field-scan-batch',
                photos: data.photos || [],
                imageUrl: data.imageUrl,
                lat: data.lat,
                lng: data.lng,
                timestamp: data.timestamp || new Date().toISOString(),
            }, '*');
        });

        return unsubscribe;
    }, []);

    const openExternal = (url) => {
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                <p className="font-medium mb-2 text-gray-900 dark:text-white">📹 {title}</p>
                <p className="text-gray-600 dark:text-gray-400">
                    <strong>Step 1:</strong> Open the camera on your device using "Open Camera Device" below.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                    <strong>Step 2:</strong> Click "View Stream" to watch the live feed.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowStream(true)}>
                    <Video className="w-4 h-4" /> View Stream
                </Button>
                <Button variant="outline" onClick={() => setShowCamera(true)}>
                    <Camera className="w-4 h-4" /> Open Camera Device
                </Button>
                <Button variant="ghost" onClick={() => openExternal(outUrl)}>
                    <ExternalLink className="w-4 h-4" /> Open in Browser
                </Button>
            </div>

            <Modal open={showStream} onClose={() => setShowStream(false)} title={`📹 ${title} — Live Stream`} size="xl">
                <div className="space-y-3">
                    {isElectron ? (
                        <ElectronWebview ref={webviewRef} src={inUrl} />
                    ) : (
                        <iframe
                            src={inUrl}
                            className="w-full h-[70vh] rounded-xl border-0 bg-black"
                            allow="camera; microphone; autoplay"
                        />
                    )}
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">
                            Camera device must be broadcasting for stream to appear.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => openExternal(outUrl)}>
                            <ExternalLink className="w-3 h-3" /> Open Camera
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal open={showCamera} onClose={() => setShowCamera(false)} title="📤 Camera Device" size="md">
                <div className="space-y-3">
                    {isElectron ? (
                        <ElectronWebview ref={webviewRef} src={outUrl} />
                    ) : (
                        <iframe
                            src={outUrl}
                            className="w-full h-[70vh] rounded-xl border-0 bg-black"
                            allow="camera; microphone; autoplay"
                        />
                    )}
                    <p className="text-xs text-gray-400 text-center">
                        Allow camera permission when prompted.
                    </p>
                </div>
            </Modal>
        </div>
    );
}

const ElectronWebview = React.forwardRef(({ src }, ref) => {
    const [error, setError] = useState(false);
    const [key, setKey] = useState(0);

    const handleRetry = () => {
        setError(false);
        setKey((prev) => prev + 1);
    };

    const handleOpenBrowser = () => {
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(src);
        } else {
            window.open(src, '_blank');
        }
    };

    return (
        <div className="relative">
            <webview
                ref={ref}
                key={key}
                src={src}
                className="w-full h-[70vh] rounded-xl"
                allowpopups
                onDidFailLoad={() => setError(true)}
            />
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
                    <div className="text-center space-y-3">
                        <p className="text-white mb-3">Stream failed to load in app.</p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Retry
                            </button>
                            <button
                                onClick={handleOpenBrowser}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" /> Open in Browser
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

ElectronWebview.displayName = 'ElectronWebview';