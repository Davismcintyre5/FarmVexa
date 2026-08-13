import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('farmvexa_cookie_consent');
        if (!consent) setShow(true);
    }, []);

    const accept = () => {
        localStorage.setItem('farmvexa_cookie_consent', 'accepted');
        setShow(false);
    };

    const decline = () => {
        localStorage.setItem('farmvexa_cookie_consent', 'declined');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-4 w-80 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl z-50 p-5">
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">🍪 Cookie Consent</h3>
                <button onClick={decline} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                We use cookies to enhance your experience. By continuing, you agree to our use of cookies.
            </p>
            <div className="flex gap-2">
                <button onClick={decline} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Decline
                </button>
                <button onClick={accept} className="flex-1 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">
                    Accept All
                </button>
            </div>
        </div>
    );
}