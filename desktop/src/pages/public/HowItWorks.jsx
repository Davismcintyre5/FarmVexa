import { UserPlus, Wheat, Cpu, TrendingUp } from 'lucide-react';

const steps = [
    { icon: UserPlus, title: 'Create Account', desc: 'Register in seconds. Your account is reviewed and approved within 24 hours.' },
    { icon: Wheat, title: 'Set Up Your Farm', desc: 'Add your farm location, fields, livestock, and crops. Everything organized.' },
    { icon: Cpu, title: 'Connect & Monitor', desc: 'Link IoT sensors, scan crops with AI, chat with your farm assistant.' },
    { icon: TrendingUp, title: 'Grow Smarter', desc: 'Get insights, alerts, reports, and make data-driven decisions.' },
];

export default function HowItWorks() {
    return (
        <section className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How It Works</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Get started in minutes and transform your farming.</p>
                </div>
                <div className="grid md:grid-cols-4 gap-8">
                    {steps.map((s, i) => (
                        <div key={i} className="text-center relative">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <s.icon className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-primary-200 dark:bg-primary-800" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}