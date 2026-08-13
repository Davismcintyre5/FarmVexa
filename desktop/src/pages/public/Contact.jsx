import { useState, useEffect } from 'react';
import axios from 'axios';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send } from 'lucide-react';

export default function Contact() {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
    }, []);

    const { supportPhone, supportEmail, whatsappNumber, showWhatsapp, appName } = settings;

    return (
        <section id="contact" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto">
                        Have questions about {appName || 'FarmVexa'}? We're here to help you get started.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {supportPhone && (
                            <a href={`tel:${supportPhone}`} 
                                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary-300 transition-all group">
                                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">{supportPhone}</p>
                                </div>
                            </a>
                        )}

                        {supportEmail && (
                            <a href={`mailto:${supportEmail}`}
                                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 transition-all group">
                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">{supportEmail}</p>
                                </div>
                            </a>
                        )}

                        {showWhatsapp && whatsappNumber && (
                            <a href={`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 transition-all group">
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">WhatsApp</p>
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">{whatsappNumber}</p>
                                </div>
                            </a>
                        )}

                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Response Time</p>
                                <p className="font-semibold text-gray-900 dark:text-white">Within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Send us a Message</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill the form below and we'll get back to you shortly.</p>
                        
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                                    <input type="text" placeholder="John Farmer" 
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                                    <input type="email" placeholder="john@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input type="tel" placeholder="+254712345678"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                                <input type="text" placeholder="How can we help?"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                                <textarea rows={4} placeholder="Tell us about your farm and how we can help..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
                            </div>
                            <button type="submit"
                                className="w-full sm:w-auto px-8 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors inline-flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}