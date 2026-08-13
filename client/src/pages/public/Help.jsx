import { HelpCircle, BookOpen, Video, MessageCircle } from 'lucide-react';

export default function Help() {
    return (
        <section id="help" className="py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <HelpCircle className="w-16 h-16 text-primary-500 mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Help Center</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Our comprehensive help center is coming soon.</p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <BookOpen className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Guides</h3>
                        <p className="text-sm text-gray-500 mt-1">Step-by-step tutorials</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Video className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Videos</h3>
                        <p className="text-sm text-gray-500 mt-1">Watch and learn</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <MessageCircle className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Live Support</h3>
                        <p className="text-sm text-gray-500 mt-1">Chat with our team</p>
                    </div>
                </div>

                <p className="text-gray-400">In the meantime, check our <a href="#faq" className="text-primary-500 hover:underline">FAQs</a> or <a href="#contact" className="text-primary-500 hover:underline">contact us</a> directly.</p>
            </div>
        </section>
    );
}