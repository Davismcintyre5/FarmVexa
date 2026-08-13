import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import axios from 'axios';

export default function Hero() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const allowRegister = settings.allowSelfRegistration !== false;
    const appName = settings.appName || 'FarmVexa';

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-green-800">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-6xl">🌾</div>
                <div className="absolute top-20 right-20 text-5xl">🐄</div>
                <div className="absolute bottom-10 left-1/4 text-4xl">🌽</div>
                <div className="absolute bottom-20 right-10 text-5xl">🐔</div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        See. Sense. Predict. <span className="text-green-300">Grow.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-green-100 mb-8">
                        AI-Powered Farm Intelligence Platform. Monitor crops, manage livestock, 
                        track finances, and get real-time insights — all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {allowRegister ? (
                            <Link to="/register" className="px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-2">
                                Get Started <ArrowRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link to="/get-access" className="px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-2">
                                Get Access <ArrowRight className="w-5 h-5" />
                            </Link>
                        )}
                        <a href="#features" className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2">
                            Learn More <Play className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950" />
        </section>
    );
}