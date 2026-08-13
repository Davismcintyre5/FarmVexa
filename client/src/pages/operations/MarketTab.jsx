import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { getFarms } from '../../api/farms';
import {
    getMarketStatus, getMyProducts, addProduct, updateProduct,
    updateProductStatus, deleteProduct, getMyInquiries,
    markInquiryRead, deleteInquiry,
} from '../../api/market';
import { uploadMarketImage } from '../../api/market';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { Plus, Trash2, Edit3, ShoppingBag, Camera, X } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function MarketTab() {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [enabled, setEnabled] = useState(true);
    const [supportPhone, setSupportPhone] = useState('');
    const [farms, setFarms] = useState([]);
    const [products, setProducts] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [unreadInquiries, setUnreadInquiries] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        name: '', description: '', category: 'vegetables', price: '', unit: 'kg',
        quantity: '', contactPhone: '', contactWhatsapp: '', contactEmail: '',
        exactDirection: '', farm: '', photos: [], status: 'active',
    });

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSupportPhone(res.data.data?.supportPhone || ''))
            .catch(() => {});
        if (isFarmer) getFarms().then((r) => setFarms(r.data.data.farms || []));
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statusRes, productsRes, inquiriesRes] = await Promise.all([
                getMarketStatus(), getMyProducts(), getMyInquiries(),
            ]);
            setEnabled(statusRes.data.data.enabled);
            setProducts(productsRes.data.data.products || []);
            setInquiries(inquiriesRes.data.data.inquiries || []);
            setUnreadInquiries(productsRes.data.data.unreadInquiries || 0);
        } catch {} finally { setLoading(false); }
    };

    const openAdd = () => {
        setEditing(null);
        setPhotoFiles([]);
        setPhotoPreviews([]);
        setForm({
            name: '', description: '', category: 'vegetables', price: '', unit: 'kg',
            quantity: '', contactPhone: user?.phone || '', contactWhatsapp: '', contactEmail: user?.email || '',
            exactDirection: '', farm: '', photos: [], status: 'active',
        });
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setPhotoFiles([]);
        setPhotoPreviews([]);
        setForm({
            name: p.name, description: p.description || '', category: p.category, price: p.price, unit: p.unit,
            quantity: p.quantity, contactPhone: p.contactPhone || '', contactWhatsapp: p.contactWhatsapp || '',
            contactEmail: p.contactEmail || '', exactDirection: p.location?.exactDirection || '',
            farm: p.farm?._id || p.farm || '', photos: p.photos || [], status: p.status,
        });
        setShowModal(true);
    };

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setPhotoFiles((prev) => [...prev, ...files]);
        setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (index) => {
        setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    };

const uploadPhotos = async () => {
    if (photoFiles.length === 0) return [];
    const uploadedUrls = [];
    for (const file of photoFiles) {
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await uploadMarketImage(fd);
            if (res.data?.data?.url) uploadedUrls.push(res.data.data.url);
        } catch (err) {
            toast.error('Failed to upload a photo');
        }
    }
    return uploadedUrls;
};

    const handleSave = async () => {
        if (!form.name || !form.price || !form.unit || !form.quantity || !form.farm) {
            return toast.error('Name, price, unit, quantity, and farm are required');
        }
        try {
            const uploadedPhotos = await uploadPhotos();
            const finalForm = { ...form, photos: [...(form.photos || []), ...uploadedPhotos] };
            if (editing) { await updateProduct(editing._id, finalForm); toast.success('Product updated'); }
            else { await addProduct(finalForm); toast.success('Product added to market'); }
            setShowModal(false);
            setPhotoFiles([]);
            setPhotoPreviews([]);
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateProductStatus(id, status);
            loadData();
            toast.success(`Product marked as ${status}`);
        } catch (err) { toast.error('Failed to update status'); }
    };

    const handleDelete = async (id) => {
        if (confirm('Remove product from market?')) {
            await deleteProduct(id);
            loadData();
            toast.success('Product removed');
        }
    };

    const handleMarkRead = async (id) => { await markInquiryRead(id); loadData(); };

    const handleDeleteInquiry = async (id) => {
        if (confirm('Delete inquiry?')) {
            await deleteInquiry(id);
            loadData();
            toast.success('Inquiry deleted');
        }
    };

    if (loading) return <Spinner />;

    if (!enabled) {
        return (
            <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Market is currently disabled</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                    The farmers market has been temporarily disabled by the administrator.
                    Please check back later.
                </p>
                {supportPhone && (
                    <p className="text-sm text-gray-400 mt-4">
                        For urgent matters, contact support:{' '}
                        <a href={`tel:${supportPhone}`} className="text-primary-500 hover:underline">{supportPhone}</a>
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">🧺 My Market Products</h3>
                    <p className="text-sm text-gray-500">{products.length} products listed</p>
                </div>
                <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Product</Button>
            </div>

            {products.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="No products yet" description="Add your farm products to the public market." actionLabel="Add Product" onAction={openAdd} />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                        <Card key={p._id}>
                            {p.photos?.[0] && (
                                <img src={p.photos[0]} alt={p.name} className="w-full h-36 object-cover rounded-lg mb-3" />
                            )}
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg truncate">{p.name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{p.category}</p>
                                    <p className="font-semibold mt-1">KES {p.price}/{p.unit}</p>
                                    <p className="text-sm text-gray-500">{p.quantity} {p.unit} available</p>
                                    <p className="text-xs text-gray-400 mt-1">📍 {p.location?.county}, {p.location?.subCounty}</p>
                                </div>
                                <Badge status={p.status} />
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t flex-wrap">
                                {p.status === 'active' && (
                                    <>
                                        <button onClick={() => handleStatusChange(p._id, 'sold')} className="text-xs text-amber-500 hover:text-amber-600">Mark Sold</button>
                                        <button onClick={() => handleStatusChange(p._id, 'inactive')} className="text-xs text-gray-400 hover:text-gray-600">Deactivate</button>
                                    </>
                                )}
                                {p.status === 'sold' && (
                                    <button onClick={() => handleStatusChange(p._id, 'active')} className="text-xs text-green-500 hover:text-green-600">Mark Active</button>
                                )}
                                {p.status === 'inactive' && (
                                    <button onClick={() => handleStatusChange(p._id, 'active')} className="text-xs text-green-500 hover:text-green-600">Activate</button>
                                )}
                                <button onClick={() => openEdit(p)}><Edit3 className="w-4 h-4 text-gray-400" /></button>
                                <button onClick={() => handleDelete(p._id)} className="ml-auto"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Inquiries */}
            <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    📋 Inquiries {unreadInquiries > 0 && <span className="text-red-500 text-sm">({unreadInquiries} unread)</span>}
                </h3>
                {inquiries.length === 0 ? (
                    <p className="text-gray-400 text-sm">No inquiries yet.</p>
                ) : (
                    <div className="space-y-2">
                        {inquiries.map((inq) => (
                            <Card key={inq._id} className={!inq.isRead ? 'border-l-4 border-l-blue-500' : ''}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{inq.buyerName} <span className="text-sm text-gray-400">→ {inq.product?.name}</span></p>
                                        <p className="text-sm text-gray-500 mt-1">{inq.message}</p>
                                        {inq.buyerPhone && <p className="text-xs text-gray-400 mt-1">📞 {inq.buyerPhone}</p>}
                                        {inq.buyerEmail && <p className="text-xs text-gray-400">📧 {inq.buyerEmail}</p>}
                                        <p className="text-xs text-gray-400">{formatDate(inq.createdAt, 'relative')}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 ml-2">
                                        {!inq.isRead && (
                                            <button onClick={() => handleMarkRead(inq._id)} className="text-xs text-primary-500">Mark read</button>
                                        )}
                                        <button onClick={() => handleDeleteInquiry(inq._id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'Add Product to Market'} size="lg">
                <div className="space-y-3">
                    <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tomatoes, Eggs, Milk..." />
                    <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                        options={['vegetables','fruits','livestock','poultry','dairy','grains','other'].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
                    <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <div className="grid grid-cols-3 gap-3">
                        <Input label="Price (KES)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                        <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, piece..." />
                        <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Photos (up to 5)</label>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
                        <div className="flex flex-wrap gap-3">
                            {(form.photos || []).map((photo, i) => (
                                <div key={`existing-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden">
                                    <img src={photo} alt={`Existing ${i + 1}`} className="w-full h-full object-cover" />
                                    <button onClick={() => removeExistingPhoto(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {photoPreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden">
                                    <img src={preview} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {((form.photos?.length || 0) + photoPreviews.length) < 5 && (
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-gray-400 hover:border-primary-500 transition-colors">
                                    <Camera className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Input label="Contact Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                        <Input label="WhatsApp" value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })} />
                        <Input label="Contact Email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                    </div>
                    <Select label="Farm" value={form.farm} onChange={(e) => setForm({ ...form, farm: e.target.value })}
                        options={farms.map((f) => ({ value: f._id, label: f.name }))} />
                    <Input label="Exact Direction" value={form.exactDirection} onChange={(e) => setForm({ ...form, exactDirection: e.target.value })} placeholder="Near Total Petrol Station..." />
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editing ? 'Update' : 'Add Product'}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}