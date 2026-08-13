import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, ArrowRight, MapPin } from 'lucide-react';

export default function MarketPreview() {
    const [products, setProducts] = useState([]);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/public/market/products`)
            .then((res) => {
                setEnabled(res.data.data?.enabled || false);
                setProducts((res.data.data?.products || []).slice(0, 3));
            })
            .catch(() => {});
    }, []);

    if (!enabled || products.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">🧺 Farmers Market</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Fresh produce straight from local farms.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <Link to="/market" key={p._id}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                            {p.photos?.[0] && (
                                <img src={p.photos[0]} alt={p.name} className="w-full h-36 object-cover" />
                            )}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white">{p.name}</h3>
                                <p className="text-sm text-gray-500 capitalize">{p.category}</p>
                                <p className="font-semibold text-primary-600 mt-2">KES {p.price}/{p.unit}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                    <MapPin className="w-3 h-3" /> {p.location?.county}, {p.location?.subCounty}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Link to="/market" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors">
                        View Full Market <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}