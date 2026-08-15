import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Video, Camera, ExternalLink, X } from 'lucide-react';

export default function ExternalCamera({ inUrl, outUrl, title = 'External Camera' }) {
    const [showStream, setShowStream] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [isElectron, setIsElectron] = useState(false);

    useEffect(() => {
        // Detect Electron environment
        setIsElectron(
            typeof window !== 'undefined' &&
            (window.navigator.userAgent.toLowerCase().includes('electron') ||
             window.require !== undefined)
        );
    }, []);

    const openExternal = (url) => {
        if (isElectron && window.require) {
            // Electron — open in system browser
            const { shell } = window.require('electron');
            shell.openExternal(url);
        } else {
            // Web — open in new tab
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-4">
            {/* Instructions */}
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

            {/* Stream Modal */}
            <Modal open={showStream} onClose={() => setShowStream(false)} title={`📹 ${title} — Live Stream`} size="xl">
                <div className="space-y-3">
                    {isElectron ? (
                        <ElectronWebview src={inUrl} />
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

            {/* Camera Device Modal */}
            <Modal open={showCamera} onClose={() => setShowCamera(false)} title="📤 Camera Device" size="md">
                <div className="space-y-3">
                    {isElectron ? (
                        <ElectronWebview src={outUrl} />
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

function ElectronWebview({ src }) {
    const [error, setError] = useState(false);

    return (
        <div className="relative">
            <webview
                src={src}
                className="w-full h-[70vh] rounded-xl"
                allowpopups
                onDidFailLoad={() => setError(true)}
            />
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="text-center">
                        <p className="text-white mb-3">Stream failed to load in app.</p>
                        <button
                            onClick={() => window.require('electron').shell.openExternal(src)}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
                        >
                            Open in Browser
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}