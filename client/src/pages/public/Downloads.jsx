import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Smartphone, Monitor, Globe, Apple } from 'lucide-react';

const platformIcons = { android: Smartphone, ios: Apple, windows: Monitor, web: Globe, all: Globe };

export default function Downloads() {
    const [downloads, setDownloads] = useState([]);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setDownloads((res.data.data?.downloads || []).filter((d) => d.enabled)))
            .catch(() => {});
    }, []);

    if (downloads.length === 0) return null;

    return (
        <section id="downloads" className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Download FarmVexa</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Available on multiple platforms.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {downloads.map((d, i) => {
                        const Icon = platformIcons[d.platform] || Globe;
                        return (
                            <a key={i} href={d.link} target="_blank" rel="noopener noreferrer"
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-center">
                                <Icon className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">{d.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Version {d.version}</p>
                                {d.description && <p className="text-xs text-gray-400 mt-2">{d.description}</p>}
                                <span className="inline-flex items-center gap-1 mt-4 text-primary-500 font-medium text-sm">
                                    <Download className="w-4 h-4" /> Download
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}