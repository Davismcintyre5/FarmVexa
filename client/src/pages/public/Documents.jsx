import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Eye, BookOpen, Shield, File } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE}/public/documents`)
            .then((res) => setDocuments(res.data.data?.documents || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const grouped = documents.reduce((acc, doc) => {
        if (!acc[doc.type]) acc[doc.type] = [];
        acc[doc.type].push(doc);
        return acc;
    }, {});

    const typeLabels = {
        user_guide: '📖 User Guides',
        pricing: '💳 Pricing',
        terms: '⚖️ Terms of Service',
        privacy: '🔒 Privacy Policy',
        cookies: '🍪 Cookie Policy',
        other: '📄 Other Documents',
    };

    const typeIcons = {
        user_guide: BookOpen,
        pricing: FileText,
        terms: Shield,
        privacy: Shield,
        cookies: File,
        other: File,
    };

    const handleDownload = async (doc) => {
        setDownloading(doc._id);
        try {
            const response = await fetch(doc.cloudinaryUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${doc.name.replace(/\s+/g, '_')}_v${doc.version || '1.0.0'}.${doc.fileType || 'pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(doc.cloudinaryUrl, '_blank');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        User guides, policies, and resources
                    </p>
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No documents available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([type, docs]) => {
                            const Icon = typeIcons[type] || File;
                            return (
                                <div key={type}>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {typeLabels[type] || type}
                                    </h2>
                                    <div className="space-y-3">
                                        {docs.map((doc) => (
                                            <div
                                                key={doc._id}
                                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                                                        <Icon className="w-5 h-5 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {doc.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            v{doc.version || '1.0.0'} · {doc.fileType?.toUpperCase()} 
                                                            {doc.fileSize ? ` · ${(doc.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={doc.cloudinaryUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDownload(doc)}
                                                        disabled={downloading === doc._id}
                                                        className="p-2 text-gray-500 hover:text-primary-500 transition-colors disabled:opacity-50"
                                                        title="Download"
                                                    >
                                                        {downloading === doc._id ? (
                                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Download className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}