import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { Download, Smartphone, Monitor, Globe, Apple, ExternalLink } from 'lucide-react';

export default function DownloadsTab() {
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => {
                const list = (res.data.data?.downloads || []).filter((d) => d.enabled);
                setDownloads(list);
            })
            .catch(() => {});
    }, []);

    const platformIcon = (p) => {
        switch (p) {
            case 'android': return <Smartphone className="w-5 h-5" />;
            case 'ios': return <Apple className="w-5 h-5" />;
            case 'windows': return <Monitor className="w-5 h-5" />;
            case 'web': return <Globe className="w-5 h-5" />;
            default: return <Globe className="w-5 h-5" />;
        }
    };

    const platformLabel = (p) => {
        switch (p) {
            case 'android': return 'Android';
            case 'ios': return 'iOS';
            case 'windows': return 'Windows';
            case 'web': return 'Web';
            case 'all': return 'All Platforms';
            default: return p;
        }
    };

    if (downloads.length === 0) {
        return (
            <EmptyState
                icon={Download}
                title="No downloads available"
                description="Check back later for app downloads."
            />
        );
    }

    return (
        <div className="space-y-4">
            {downloads.map((d, i) => (
                <Card key={i}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600">
                            {platformIcon(d.platform)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{d.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    v{d.version}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {platformLabel(d.platform)}
                                </span>
                            </div>
                            {d.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{d.description}</p>
                            )}
                        </div>
                        <a href={d.link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm">
                                <Download className="w-4 h-4" /> Download
                            </Button>
                        </a>
                    </div>
                </Card>
            ))}
        </div>
    );
}