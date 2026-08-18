import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Eye, BookOpen, Shield, File } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function DocumentsTab() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE}/public/documents`)
            .then((res) => setDocuments(res.data.data?.documents || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

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
        } catch {
            window.open(doc.cloudinaryUrl, '_blank');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-10">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents available.</p>
            </div>
        );
    }

    const typeLabels = {
        user_guide: '📖 User Guide',
        pricing: '💳 Pricing',
        terms: '⚖️ Terms',
        privacy: '🔒 Privacy',
        cookies: '🍪 Cookies',
        other: '📄 Other',
    };

    const typeIcons = { user_guide: BookOpen, pricing: FileText, terms: Shield, privacy: Shield, cookies: File, other: File };

    return (
        <div className="space-y-3">
            {documents.map((doc) => {
                const Icon = typeIcons[doc.type] || File;
                const fileSizeMB = doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(1) : null;

                return (
                    <div key={doc._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                <p className="text-xs text-gray-500">
                                    {typeLabels[doc.type] || doc.type} · v{doc.version || '1.0.0'} · {doc.fileType?.toUpperCase()}
                                    {fileSizeMB && ` · ${fileSizeMB} MB`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <a href={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-primary-500" title="View">
                                <Eye className="w-4 h-4" />
                            </a>
                            <button onClick={() => handleDownload(doc)} disabled={downloading === doc._id} className="p-2 text-gray-500 hover:text-primary-500 disabled:opacity-50" title="Download">
                                {downloading === doc._id ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}