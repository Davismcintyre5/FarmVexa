import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getAnimals } from '../../api/animals';
import { getFields } from '../../api/fields';
import { getPrices } from '../../api/prices';
import { getProductionRecords, addProductionRecord, deleteProductionRecord } from '../../api/production';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, GitBranch, Wheat } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ProductionTab({ readOnly = false }) {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [fields, setFields] = useState([]);
    const [prices, setPrices] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [prodMode, setProdMode] = useState('animal');
    const [form, setForm] = useState({ animal: '', field: '', type: 'milk', cropType: '', date: new Date().toISOString().split('T')[0], quantity: '', unit: 'litre', quality: 'grade_a' });
    const [calculatedValue, setCalculatedValue] = useState(null);

    useEffect(() => { if (!isFarmer && user?.farm) setFarmId(user.farm); }, [user]);
    useEffect(() => { if (isFarmer) getFarms().then((r) => setFarms(r.data.data.farms || [])); else if (user?.farm) setFarms([{ _id: user.farm, name: 'Assigned Farm' }]); }, [isFarmer, user]);
    useEffect(() => {
        if (farmId) {
            setLoading(true);
            Promise.all([getAnimals(farmId), getFields(farmId), getProductionRecords(farmId, { limit: 50 }), getPrices(farmId)])
                .then(([a, f, r, p]) => {
                    setAnimals(a.data.data.animals || []);
                    setFields(f.data.data.fields || []);
                    setRecords(r.data.data.records || []);
                    setSummary(r.data.data.summary);
                    setPrices(p.data.data.prices || []);
                }).finally(() => setLoading(false));
        }
    }, [farmId]);

   const getProductName = (type) => {
    if (prodMode === 'crop' && form.cropType) return form.cropType.toLowerCase();
    if (type === 'milk') return 'milk';
    if (type === 'eggs') return 'eggs';
    if (type === 'meat') return 'chicken';
    return type;
};

    const calculateValue = (type, unit, quality, quantity) => {
        const productName = getProductName(type);
        const price = prices.find((p) => p.product === productName && p.unit === unit && (p.quality || 'grade_a') === quality);
        return price && quantity ? (Number(quantity) * price.pricePerUnit).toFixed(2) : null;
    };

    useEffect(() => {
        setCalculatedValue(calculateValue(form.type, form.unit, form.quality, form.quantity));
    }, [form.type, form.unit, form.quality, form.quantity, form.cropType, prices]);

    const openAdd = () => {
        setProdMode('animal');
        setForm({ animal: '', field: '', type: 'milk', cropType: '', date: new Date().toISOString().split('T')[0], quantity: '', unit: 'litre', quality: 'grade_a' });
        setCalculatedValue(null);
        setShowModal(true);
    };

    const handleModeChange = (mode) => {
        setProdMode(mode);
        if (mode === 'animal') {
            setForm({ ...form, type: 'milk', field: '', cropType: '', unit: 'litre' });
        } else {
            setForm({ ...form, type: 'harvest', animal: '', unit: 'kg' });
        }
    };

    const handleFieldChange = (fieldId) => {
        const field = fields.find((f) => f._id === fieldId);
        if (field) {
            setForm({ ...form, field: fieldId, cropType: field.crop || '' });
        }
    };

    const handleTypeChange = (type) => {
        const units = { milk: 'litre', eggs: 'tray', meat: 'kg', harvest: 'kg', breeding: 'head', other: 'kg' };
        setForm({ ...form, type, unit: units[type] || 'kg' });
    };

const handleSave = async () => {
    if (prodMode === 'animal' && !form.animal) return toast.error('Select an animal');
    if (prodMode === 'crop' && !form.field) return toast.error('Select a field');
    if (!form.quantity) return toast.error('Enter quantity');

    const data = {
        type: prodMode === 'crop' ? (form.cropType || 'harvest') : form.type,
        date: form.date,
        quantity: Number(form.quantity),
        unit: form.unit,
        quality: form.quality,
        totalValue: calculatedValue ? Number(calculatedValue) : undefined,
    };

    if (prodMode === 'animal') {
        data.animal = form.animal;
    } else {
        data.field = form.field;
    }

    try {
        await addProductionRecord(farmId, data);
        toast.success('Recorded');
        setShowModal(false);
        getProductionRecords(farmId, { limit: 50 }).then((r) => { setRecords(r.data.data.records || []); setSummary(r.data.data.summary); });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
};

    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteProductionRecord(id); setRecords((p) => p.filter((r) => r._id !== id)); toast.success('Deleted'); } };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {isFarmer ? <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" /> : <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>}
                {!readOnly && farmId && <Button onClick={openAdd}><Plus className="w-4 h-4" /> Record Production</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : (
                <>
                    {summary && (
                        <div className="grid grid-cols-3 gap-4">
                            <Card><p className="text-2xl font-bold">{summary.count}</p><p className="text-sm text-gray-500">Records</p></Card>
                            <Card><p className="text-2xl font-bold">KES {summary.totalValue?.toLocaleString()}</p><p className="text-sm text-gray-500">Total Value</p></Card>
                            <Card><p className="text-2xl font-bold">{Object.keys(summary.byType || {}).length}</p><p className="text-sm text-gray-500">Products</p></Card>
                        </div>
                    )}
                    {records.length === 0 ? <EmptyState title="No production records" /> : (
                        <div className="space-y-2">
                            {records.map((r) => (
                                <Card key={r._id}>
                                    <div className="flex justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium capitalize truncate">
                                                {r.type} — {r.animal?.name || r.animal?.tagId || r.field?.name || '—'}
                                            </p>
                                            <p className="text-sm text-gray-500">{r.quantity} {r.unit} · {r.quality} {r.totalValue ? `· KES ${r.totalValue}` : ''}</p>
                                            <p className="text-xs text-gray-400">{formatDate(r.date, 'date')}</p>
                                        </div>
                                        {!readOnly && <button onClick={() => handleDelete(r._id)} className="flex-shrink-0 ml-2"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {!readOnly && (
                <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Production" size="lg">
                    <div className="space-y-3">
                        {/* Mode Toggle */}
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <button onClick={() => handleModeChange('animal')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${prodMode === 'animal' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-500'}`}>
                                <GitBranch className="w-4 h-4" /> Animal
                            </button>
                            <button onClick={() => handleModeChange('crop')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${prodMode === 'crop' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-500'}`}>
                                <Wheat className="w-4 h-4" /> Crop
                            </button>
                        </div>

                        {/* Animal Mode */}
                        {prodMode === 'animal' && (
                            <>
                                <Select label="Animal" value={form.animal} onChange={(e) => setForm({ ...form, animal: e.target.value })}
                                    options={animals.map((a) => ({ value: a._id, label: a.name || a.tagId }))} />
                                <Select label="Type" value={form.type} onChange={(e) => handleTypeChange(e.target.value)}
                                    options={['milk','eggs','meat','breeding','other'].map((v) => ({ value: v, label: v }))} />
                            </>
                        )}

                        {/* Crop Mode */}
                        {prodMode === 'crop' && (
                            <>
                                <Select label="Field" value={form.field} onChange={(e) => handleFieldChange(e.target.value)}
                                    options={fields.filter((f) => f.crop).map((f) => ({ value: f._id, label: `${f.name} (${f.crop})` }))} />
                                {form.cropType && <p className="text-sm text-gray-500">Crop: <span className="font-medium capitalize">{form.cropType}</span></p>}
                                <input type="hidden" value="harvest" />
                            </>
                        )}

                        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                            <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                options={[{ value: 'litre', label: 'Litre' }, { value: 'tray', label: 'Tray' }, { value: 'piece', label: 'Piece' }, { value: 'kg', label: 'Kg' }, { value: 'bird', label: 'Bird' }, { value: 'head', label: 'Head' }]} />
                        </div>
                        <Select label="Quality" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}
                            options={[{ value: 'grade_a', label: 'Grade A' }, { value: 'grade_b', label: 'Grade B' }, { value: 'grade_c', label: 'Grade C' }]} />

                        {calculatedValue !== null && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <p className="text-sm text-gray-500">Estimated Value</p>
                                <p className="text-lg font-bold text-green-600">KES {Number(calculatedValue).toLocaleString()}</p>
                            </div>
                        )}
                        {calculatedValue === null && form.quantity && (
                            <p className="text-sm text-orange-500">No price set. Set price in Finance tab.</p>
                        )}
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}