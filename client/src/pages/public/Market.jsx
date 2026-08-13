import { useState, useEffect } from 'react';
import { getPublicMarketStatus, getPublicProducts, getPublicProduct, sendInquiry } from '../../api/publicMarket';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { ShoppingBag, MapPin, Phone, Mail, MessageCircle, Search, Package, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Market() {
    const [enabled, setEnabled] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showInquiry, setShowInquiry] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({ buyerName: '', buyerEmail: '', buyerPhone: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [category, search]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await getPublicProducts({ category, search });
            setEnabled(res.data.data.enabled);
            setProducts(res.data.data.products || []);
            setCategories(res.data.data.categories || []);
        } catch {} finally { setLoading(false); }
    };

    const openDetail = async (id) => {
        try {
            const res = await getPublicProduct(id);
            setSelectedProduct(res.data.data.product);
            setShowDetail(true);
        } catch (err) { toast.error('Product not available'); }
    };

    const handleInquiry = async () => {
        if (!inquiryForm.buyerName || !inquiryForm.message) {
            return toast.error('Name and message are required');
        }
        setSubmitting(true);
        try {
            await sendInquiry(selectedProduct._id, inquiryForm);
            toast.success('Inquiry sent to farmer!');
            setInquiryForm({ buyerName: '', buyerEmail: '', buyerPhone: '', message: '' });
            setShowInquiry(false);
            setShowDetail(false);
        } catch (err) { toast.error('Failed to send inquiry'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <Spinner size="lg" className="mt-20" />;

    if (!enabled) {
        return (
            <section className="py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Coming Soon</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">The farmers market is currently under construction. Check back soon!</p>
                </div>
            </section>
        );
    }

    const categoryLabel = (c) => {
        const labels = { vegetables: '🥬 Vegetables', fruits: '🍎 Fruits', livestock: '🐄 Livestock', poultry: '🐔 Poultry', dairy: '🥛 Dairy', grains: '🌾 Grains', other: '📦 Other' };
        return labels[c] || c;
    };

    return (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <ShoppingBag className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">🧺 Farmers Market</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
                        Fresh produce and farm products directly from local farmers. Browse, connect, and buy.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        options={[
                            { value: '', label: 'All Categories' },
                            ...categories.map((c) => ({ value: c, label: categoryLabel(c) })),
                        ]}
                        className="w-full sm:w-56"
                    />
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <EmptyState icon={Package} title="No products found" description="Try changing your search or filters." />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((p) => (
                            <div
                                key={p._id}
                                onClick={() => openDetail(p._id)}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
                            >
                                {p.photos?.[0] ? (
                                    <img src={p.photos[0]} alt={p.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-full h-44 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{p.name}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{categoryLabel(p.category)}</p>
                                        </div>
                                        <span className="font-bold text-primary-600 text-lg flex-shrink-0 ml-2">
                                            KES {p.price}
                                            <span className="text-xs text-gray-400 font-normal">/{p.unit}</span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{p.quantity} {p.unit} available</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                        <MapPin className="w-3 h-3" /> {p.location?.county}, {p.location?.subCounty}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            <Modal open={showDetail} onClose={() => { setShowDetail(false); setShowInquiry(false); }} title={selectedProduct?.name} size="lg">
                {selectedProduct && !showInquiry ? (
                    <div className="space-y-4">
                        {/* Photos */}
                        {selectedProduct.photos?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {selectedProduct.photos.map((photo, i) => (
                                    <img key={i} src={photo} alt={`${selectedProduct.name} ${i + 1}`} className="rounded-xl h-28 w-full object-cover" />
                                ))}
                            </div>
                        ) : (
                            <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-300" />
                            </div>
                        )}

                        {selectedProduct.description && (
                            <p className="text-gray-600 dark:text-gray-300">{selectedProduct.description}</p>
                        )}

                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-semibold text-gray-900 dark:text-white">KES {selectedProduct.price}/{selectedProduct.unit}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-xs text-gray-500">Quantity</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct.quantity} {selectedProduct.unit}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedProduct.category}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-primary-500" /> Location
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {selectedProduct.location?.county}, {selectedProduct.location?.subCounty}
                            </p>
                            {selectedProduct.location?.exactDirection && (
                                <p className="text-xs text-gray-500 mt-1">{selectedProduct.location.exactDirection}</p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                            {selectedProduct.contactPhone && (
                                <a href={`tel:${selectedProduct.contactPhone}`} className="flex items-center gap-1 text-primary-500 hover:underline">
                                    <Phone className="w-4 h-4" /> {selectedProduct.contactPhone}
                                </a>
                            )}
                            {selectedProduct.contactWhatsapp && (
                                <a href={`https://wa.me/${selectedProduct.contactWhatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-green-500 hover:underline">
                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                </a>
                            )}
                            {selectedProduct.contactEmail && (
                                <a href={`mailto:${selectedProduct.contactEmail}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                    <Mail className="w-4 h-4" /> Email
                                </a>
                            )}
                        </div>

                        <Button onClick={() => setShowInquiry(true)} className="w-full">
                            📩 Inquire About This Product
                        </Button>
                    </div>
                ) : selectedProduct && showInquiry ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">📩 Inquire: {selectedProduct.name}</h3>
                            <button onClick={() => setShowInquiry(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <Input label="Your Name *" value={inquiryForm.buyerName} onChange={(e) => setInquiryForm({ ...inquiryForm, buyerName: e.target.value })} />
                            <Input label="Email" type="email" value={inquiryForm.buyerEmail} onChange={(e) => setInquiryForm({ ...inquiryForm, buyerEmail: e.target.value })} />
                            <Input label="Phone" value={inquiryForm.buyerPhone} onChange={(e) => setInquiryForm({ ...inquiryForm, buyerPhone: e.target.value })} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                                <textarea
                                    value={inquiryForm.message}
                                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                                    rows={3}
                                    placeholder="Do you have 10kg available? What's the best time to pick up?"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                />
                            </div>
                            <Button onClick={handleInquiry} loading={submitting} className="w-full">Send Inquiry</Button>
                            <p className="text-xs text-gray-400 text-center">The farmer will receive your inquiry via SMS and email.</p>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </section>
    );
}