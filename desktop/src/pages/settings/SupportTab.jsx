import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import { Headphones, Phone, Mail, MessageCircle, Clock } from 'lucide-react';

export default function SupportTab() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const { supportPhone, supportEmail, whatsappNumber, showWhatsapp } = settings;

    return (
        <Card>
            <div className="text-center space-y-6">
                <div>
                    <Headphones className="w-14 h-14 mx-auto text-primary-500 mb-3" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Need Help?</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">We're here to assist you</p>
                </div>

                <div className="grid gap-3">
                    {supportPhone && (
                        <a href={`tel:${supportPhone}`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                            <div className="p-2.5 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{supportPhone}</p>
                            </div>
                        </a>
                    )}

                    {supportEmail && (
                        <a href={`mailto:${supportEmail}`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                            <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{supportEmail}</p>
                            </div>
                        </a>
                    )}

                    {showWhatsapp && whatsappNumber && (
                        <a href={`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{whatsappNumber}</p>
                            </div>
                        </a>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-2">
                    <Clock className="w-4 h-4" />
                    <span>Response time: Usually within 24 hours</span>
                </div>
            </div>
        </Card>
    );
}