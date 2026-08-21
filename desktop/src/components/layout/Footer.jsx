import { useState, useEffect } from 'react';
import { getVersion } from '../../utils/version';

export default function Footer() {
    const [version, setVersion] = useState('');

    useEffect(() => {
        getVersion().then(setVersion);
    }, []);

    return (
        <footer className="h-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center px-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} FarmVexa. See. Sense. Predict. Grow.
                {version && <span className="ml-1 text-gray-300 dark:text-gray-600">v{version}</span>}
            </p>
        </footer>
    );
}