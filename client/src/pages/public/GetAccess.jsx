import { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Mail, MessageCircle, ClipboardCheck, UserPlus, Clock } from 'lucide-react';

export default function GetAccess() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const { supportPhone, supportEmail, whatsappNumber, showWhatsapp, appName } = settings;

    return (
        <section className="py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Get Access to {appName || 'FarmVexa'}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">{appName || 'FarmVexa'} is currently available by invitation only. Here's how to get started.</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/50">
                                <UserPlus className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">1. Contact the Admin Team</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Reach out to us through any of the channels below. Let us know your name, location, and farm details.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/50">
                                <ClipboardCheck className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">2. Account Setup</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Our team will create your account and set up your farm profile. You'll receive login credentials via email or SMS.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/50">
                                <Clock className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">3. Approval & Onboarding</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Once approved (usually within 24 hours), you'll receive a welcome email with everything you need to get started.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Contact Us Now</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {supportPhone && (
                            <a href={`tel:${supportPhone}`} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow transition-shadow">
                                <Phone className="w-5 h-5 text-primary-500" />
                                <div><p className="text-sm text-gray-500">Call</p><p className="font-medium text-gray-900 dark:text-white">{supportPhone}</p></div>
                            </a>
                        )}
                        {supportEmail && (
                            <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow transition-shadow">
                                <Mail className="w-5 h-5 text-primary-500" />
                                <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-900 dark:text-white">{supportEmail}</p></div>
                            </a>
                        )}
                        {showWhatsapp && whatsappNumber && (
                            <a href={`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg hover:shadow transition-shadow">
                                <MessageCircle className="w-5 h-5 text-green-500" />
                                <div><p className="text-sm text-gray-500">WhatsApp</p><p className="font-medium text-gray-900 dark:text-white">{whatsappNumber}</p></div>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}