import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function CTA() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const allowRegister = settings.allowSelfRegistration !== false;

    return (
        <section className="py-16 md:py-24 bg-primary-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Farm?</h2>
                <p className="text-green-100 text-lg mb-8">Join thousands of farmers using AI to grow smarter. Start free today.</p>
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
                    <a href="#contact" className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                        Contact Sales
                    </a>
                </div>
            </div>
        </section>
    );
}