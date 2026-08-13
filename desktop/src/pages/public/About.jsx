import { Target, Eye, Heart } from 'lucide-react';

export default function About() {
    return (
        <section className="py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">About FarmVexa</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Empowering farmers with AI-driven intelligence.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Target className="w-7 h-7 text-primary-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Mission</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">To make smart farming accessible to every farmer through AI and IoT technology.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-7 h-7 text-primary-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Vision</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">A world where every farm is monitored, analyzed, and optimized for maximum yield.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-7 h-7 text-primary-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Values</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Innovation, accessibility, sustainability, and farmer-first design.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}