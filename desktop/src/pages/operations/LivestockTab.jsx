import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getAnimals, addAnimal, updateAnimal, updateAnimalStatus, recordMortality, deleteAnimal } from '../../api/animals';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, Edit3, Skull } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LivestockTab({ readOnly = false }) {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ tagId: '', type: 'cattle', breed: '', category: '', name: '', gender: '', weight: '', status: 'active', isBatch: false, batchQuantity: '' });

    useEffect(() => {
        if (!isFarmer && user?.farm) {
            setFarmId(user.farm);
        }
    }, [user]);

    useEffect(() => {
        if (isFarmer) {
            getFarms().then((r) => setFarms(r.data.data.farms || []));
        } else if (user?.farm) {
            setFarms([{ _id: user.farm, name: 'Assigned Farm' }]);
        }
    }, [isFarmer, user]);

    useEffect(() => {
        if (farmId) { setLoading(true); getAnimals(farmId).then((r) => setAnimals(r.data.data.animals || [])).finally(() => setLoading(false)); }
    }, [farmId]);

    const openAdd = () => { setEditing(null); setForm({ tagId: '', type: 'cattle', breed: '', category: '', name: '', gender: '', weight: '', status: 'active', isBatch: false, batchQuantity: '' }); setShowModal(true); };
    const openEdit = (a) => { setEditing(a); setForm({ tagId: a.tagId, type: a.type, breed: a.breed || '', category: a.category || '', name: a.name || '', gender: a.gender || '', weight: a.weight || '', status: a.status, isBatch: a.isBatch, batchQuantity: a.batchQuantity || '' }); setShowModal(true); };

    const handleSave = async () => {
        if (!form.tagId) return toast.error('Tag ID required');
        try {
            if (editing) { await updateAnimal(editing._id, form); toast.success('Updated'); }
            else { await addAnimal(farmId, { ...form, batchQuantity: form.isBatch ? Number(form.batchQuantity) : undefined, batchCurrent: form.isBatch ? Number(form.batchQuantity) : undefined }); toast.success('Added'); }
            setShowModal(false); getAnimals(farmId).then((r) => setAnimals(r.data.data.animals || []));
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteAnimal(id); setAnimals((p) => p.filter((a) => a._id !== id)); toast.success('Deleted'); } };
    const handleMortality = async (id) => { const c = prompt('Number of deaths:'); if (c) { await recordMortality(id, c); getAnimals(farmId).then((r) => setAnimals(r.data.data.animals || [])); toast.success('Recorded'); } };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {isFarmer ? (
                    <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" />
                ) : (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>
                )}
                {!readOnly && farmId && <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Animal</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : animals.length === 0 ? <EmptyState title="No animals" actionLabel={!readOnly ? 'Add Animal' : undefined} onAction={!readOnly ? openAdd : undefined} /> : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {animals.map((a) => (
                        <Card key={a._id}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg">{a.isBatch ? a.batchName || a.tagId : a.name || a.tagId}</p>
                                    <p className="text-sm text-gray-500">{a.type} {a.breed && `· ${a.breed}`}</p>
                                    {a.isBatch ? <p className="text-sm">{a.batchCurrent}/{a.batchQuantity} birds</p> : <p className="text-sm">{a.weight}kg</p>}
                                </div>
                                <Badge status={a.status} />
                            </div>
                            {!readOnly && (
                                <div className="flex gap-2 mt-3 pt-3 border-t">
                                    <button onClick={() => openEdit(a)} className="text-gray-400 hover:text-primary-500"><Edit3 className="w-4 h-4" /></button>
                                    {a.isBatch && <button onClick={() => handleMortality(a._id)} className="text-gray-400 hover:text-red-500"><Skull className="w-4 h-4" /></button>}
                                    <button onClick={() => handleDelete(a._id)} className="text-gray-400 hover:text-red-500 ml-auto"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {!readOnly && (
                <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Animal' : 'Add Animal'}>
                    <div className="space-y-3">
                        <Input label="Tag ID" value={form.tagId} onChange={(e) => setForm({ ...form, tagId: e.target.value })} />
                        <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={['cattle','goat','sheep','pig','poultry','other'].map((v) => ({ value: v, label: v }))} />
                        <Input label="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
                        {!form.isBatch && <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
                        {!form.isBatch && <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} options={[{ value: '', label: 'Select' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />}
                        {!form.isBatch && <Input label="Weight (kg)" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />}
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isBatch} onChange={(e) => setForm({ ...form, isBatch: e.target.checked })} /> Poultry Batch</label>
                        {form.isBatch && <Input label="Batch Name" value={form.batchName || ''} onChange={(e) => setForm({ ...form, batchName: e.target.value })} />}
                        {form.isBatch && <Input label="Initial Quantity" type="number" value={form.batchQuantity} onChange={(e) => setForm({ ...form, batchQuantity: e.target.value })} />}
                        <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></div>
                    </div>
                </Modal>
            )}
        </div>
    );
}