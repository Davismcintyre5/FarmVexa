import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, MessageCircle, FileText } from 'lucide-react';
import LegalModal from './LegalModal';

export default function Footer() {
    const [settings, setSettings] = useState({});
    const [legalType, setLegalType] = useState(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const { supportPhone, supportEmail, whatsappNumber, showWhatsapp } = settings;

    return (
        <>
            <footer id="terms" className="bg-gray-900 text-gray-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">🌾 FarmVexa</h3>
                            <p className="text-sm text-gray-400">AI-Powered Farm Intelligence.<br />See. Sense. Predict. Grow.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
                            <div className="space-y-2 text-sm">
                                <Link to="/login" className="block hover:text-white">Login</Link>
                                <Link to={settings.allowSelfRegistration !== false ? '/register' : '/get-access'} className="block hover:text-white">
                                    {settings.allowSelfRegistration !== false ? 'Register' : 'Get Access'}
                                </Link>
                                <a href="#features" className="block hover:text-white">Features</a>
                                <a href="#downloads" className="block hover:text-white">Downloads</a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-3">Support</h4>
                            <div className="space-y-2 text-sm">
                                <a href="#contact" className="block hover:text-white">Contact Us</a>
                                <a href="#help" className="block hover:text-white">Help Center</a>
                                <a href="#faq" className="block hover:text-white">FAQs</a>
                                <Link to="/documents" className="flex items-center gap-2 hover:text-white">
                                    <FileText className="w-4 h-4" /> Documents
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-3">Contact</h4>
                            <div className="space-y-2 text-sm">
                                {supportPhone && (
                                    <a href={`tel:${supportPhone}`} className="flex items-center gap-2 hover:text-white">
                                        <Phone className="w-4 h-4" /> {supportPhone}
                                    </a>
                                )}
                                {supportEmail && (
                                    <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-white">
                                        <Mail className="w-4 h-4" /> {supportEmail}
                                    </a>
                                )}
                                {showWhatsapp && whatsappNumber && (
                                    <a href={`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-white">
                                        <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                                <button onClick={() => setLegalType('terms')} className="hover:text-white transition-colors">
                                    Terms of Service
                                </button>
                                <button onClick={() => setLegalType('privacy')} className="hover:text-white transition-colors">
                                    Privacy Policy
                                </button>
                                <button onClick={() => setLegalType('cookies')} className="hover:text-white transition-colors">
                                    Cookie Policy
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">
                                © {new Date().getFullYear()} FarmVexa. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
        </>
    );
}