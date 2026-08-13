import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

export default function LegalModal({ type, onClose }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => {
                const settings = res.data.data || {};
                const legal = settings.legal || {};
                const legalContent = {
                    terms: legal.termsOfService || 'Terms of Service content will be available soon.',
                    privacy: legal.privacyPolicy || 'Privacy Policy content will be available soon.',
                    cookies: legal.cookiePolicy || 'Cookie Policy content will be available soon.',
                };
                setContent(legalContent[type] || 'Content not available.');
            })
            .catch(() => setContent('Failed to load content.'))
            .finally(() => setLoading(false));
    }, [type]);

    const titles = { terms: 'Terms of Service', privacy: 'Privacy Policy', cookies: 'Cookie Policy' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{titles[type] || 'Legal'}</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {content}
                        </div>
                    )}
                </div>
                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-gray-50 dark:bg-gray-900">
                    <button onClick={onClose} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}