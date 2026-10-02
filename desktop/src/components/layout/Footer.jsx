import { useState, useEffect } from 'react';
import { getVersion } from '../../utils/version';

export default function Footer() {
    const [version, setVersion] = useState('');
    const [updateMessage, setUpdateMessage] = useState('');
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        getVersion().then(setVersion);
    }, []);

    useEffect(() => {
        if (!window.electronAPI) return;

        window.electronAPI.onUpdateMessage?.((msg) => {
            setUpdateMessage(msg);
            if (msg?.toLowerCase().includes('up to date') || msg?.toLowerCase().includes('downloaded')) {
                setProgress(null);
            }
        });

        window.electronAPI.onDownloadProgress?.((percent) => {
            setProgress(percent);
        });

        window.electronAPI.onUpdateError?.(() => {
            setProgress(null);
            setUpdateMessage('');
        });
    }, []);

    const isDownloading = progress !== null && progress < 100;

    return (
        <footer className="h-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                {version && <p className="text-xs text-gray-400 dark:text-gray-500">v{version}</p>}
                {isDownloading && (
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {updateMessage || `Updating ${progress}%`}
                        </span>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} FarmVexa. See. Sense. Predict. Grow.
            </p>
        </footer>
    );
}