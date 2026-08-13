import { Camera, Cpu, MessageCircle, BarChart3, GitBranch, DollarSign, CloudSun, Package } from 'lucide-react';

const features = [
    { icon: Camera, title: 'AI Crop Scanner', desc: 'Detect diseases, pests, and nutrient deficiencies with a simple photo using AI.' },
    { icon: Cpu, title: 'IoT Sensors', desc: 'Real-time soil moisture, temperature, humidity monitoring with ESP32 devices.' },
    { icon: MessageCircle, title: 'AI Assistant', desc: 'Get instant farming advice in English or Swahili powered by AI.' },
    { icon: BarChart3, title: 'Reports & Analytics', desc: 'Daily briefings, production reports, financial summaries — all automated.' },
    { icon: GitBranch, title: 'Livestock Management', desc: 'Track animals, health records, vaccinations, and breeding cycles.' },
    { icon: DollarSign, title: 'Finance & Sales', desc: 'Record sales, expenses, set pricing, print receipts, and track profits.' },
    { icon: CloudSun, title: 'Weather Intelligence', desc: '7-day forecasts, severe weather alerts, and farming recommendations.' },
    { icon: Package, title: 'Stock & Inventory', desc: 'Manage production stock, farm inputs, and get low-stock alerts.' },
];

export default function Features() {
    return (
        <section id="features" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Everything You Need</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">Powerful tools to transform your farming — from small-scale to commercial.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                            <f.icon className="w-10 h-10 text-primary-500 mb-4" />
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}