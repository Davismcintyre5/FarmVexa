import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    { q: 'What is FarmVexa?', a: 'FarmVexa is an AI-powered farm intelligence platform that helps farmers monitor crops, manage livestock, track finances, and make data-driven decisions.' },
    { q: 'How does crop scanning work?', a: 'Take a photo of your crop leaf using your phone. Our AI analyzes it for diseases, pests, and nutrient deficiencies, giving you instant results and recommendations.' },
    { q: 'Is it free?', a: 'We offer a free plan with basic features. Premium plans unlock more farms, devices, and AI requests per day.' },
    { q: 'Can I use it on my phone?', a: 'Yes! FarmVexa works on any device — phone, tablet, or computer. We also have an Android app available for download.' },
    { q: 'How do I connect sensors?', a: 'You can connect ESP32-based IoT sensors to monitor soil moisture, temperature, humidity, and light. We provide a wiring guide and code.' },
    { q: 'Is my data secure?', a: 'Yes. Your farm data is private and secure. Only you and your team members can access it.' },
    { q: 'How do I get started?', a: 'Simply register an account, wait for approval (usually within 24 hours), then create your farm and start monitoring.' },
    { q: 'What support do you offer?', a: 'We offer phone, email, and WhatsApp support. Response time is usually within 24 hours.' },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section id="faq" className="py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Everything you need to know.</p>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left">
                                <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
                            </button>
                            {openIndex === i && (
                                <div className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400">{faq.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}