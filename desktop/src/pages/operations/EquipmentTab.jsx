import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getEquipment, addEquipment, updateEquipment, recordMaintenance, deleteEquipment } from '../../api/equipment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, Edit3, Wrench } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function EquipmentTab({ readOnly = false }) {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [items, setItems] = useState([]);
    const [maintenanceDue, setMaintenanceDue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [maintModal, setMaintModal] = useState(null);
    const [form, setForm] = useState({ name: '', category: 'tractor', purchaseDate: '', cost: '', condition: 'good', maintenanceFrequency: 'monthly' });
    const [maintForm, setMaintForm] = useState({ cost: '', notes: '', condition: 'good' });

    useEffect(() => { if (!isFarmer && user?.farm) setFarmId(user.farm); }, [user]);
    useEffect(() => { if (isFarmer) getFarms().then((r) => setFarms(r.data.data.farms || [])); else if (user?.farm) setFarms([{ _id: user.farm, name: 'Assigned Farm' }]); }, [isFarmer, user]);
    useEffect(() => { if (farmId) { setLoading(true); getEquipment(farmId).then((r) => { setItems(r.data.data.items || []); setMaintenanceDue(r.data.data.maintenanceDue || []); }).finally(() => setLoading(false)); } }, [farmId]);

    const openAdd = () => { setEditing(null); setForm({ name: '', category: 'tractor', purchaseDate: '', cost: '', condition: 'good', maintenanceFrequency: 'monthly' }); setShowModal(true); };
    const openEdit = (i) => { setEditing(i); setForm({ name: i.name, category: i.category, purchaseDate: i.purchaseDate?.split('T')[0] || '', cost: i.cost || '', condition: i.condition, maintenanceFrequency: i.maintenanceFrequency || 'monthly' }); setShowModal(true); };

    const handleSave = async () => { if (!form.name) return toast.error('Name required'); try { editing ? await updateEquipment(editing._id, form) : await addEquipment(farmId, { ...form, cost: Number(form.cost) }); toast.success(editing ? 'Updated' : 'Added'); setShowModal(false); getEquipment(farmId).then((r) => { setItems(r.data.data.items || []); setMaintenanceDue(r.data.data.maintenanceDue || []); }); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
    const handleMaintenance = async () => { if (!maintModal) return; try { await recordMaintenance(maintModal._id, maintForm); toast.success('Recorded'); setMaintModal(null); getEquipment(farmId).then((r) => { setItems(r.data.data.items || []); setMaintenanceDue(r.data.data.maintenanceDue || []); }); } catch { toast.error('Failed'); } };
    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteEquipment(id); setItems((p) => p.filter((i) => i._id !== id)); toast.success('Deleted'); } };

    const conditionColors = { new: 'bg-green-100 text-green-700', good: 'bg-blue-100 text-blue-700', fair: 'bg-yellow-100 text-yellow-700', poor: 'bg-orange-100 text-orange-700', broken: 'bg-red-100 text-red-700' };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {isFarmer ? <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" /> : <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>}
                {!readOnly && farmId && <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Equipment</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : (
                <>
                    {maintenanceDue.length > 0 && <Card title="⚠️ Maintenance Due">{maintenanceDue.map((i) => <p key={i._id} className="text-sm text-orange-600">{i.name}: {i.nextMaintenance ? formatDate(i.nextMaintenance, 'date') : 'Now'}</p>)}</Card>}
                    {items.length === 0 ? <EmptyState title="No equipment" /> : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((i) => (
                                <Card key={i._id}>
                                    <p className="font-bold">{i.name}</p>
                                    <div className="flex items-center gap-2 mt-1"><span className={`px-2 py-0.5 rounded text-xs font-medium ${conditionColors[i.condition]}`}>{i.condition}</span><span className="text-sm text-gray-500">{i.category}</span></div>
                                    {i.cost && <p className="text-sm text-gray-500">KES {i.cost.toLocaleString()}</p>}
                                    {i.nextMaintenance && <p className="text-xs text-gray-400">Next: {formatDate(i.nextMaintenance, 'date')}</p>}
                                    {!readOnly && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t">
                                            <button onClick={() => { setMaintModal(i); setMaintForm({ cost: '', notes: '', condition: i.condition }); }} className="text-gray-400 hover:text-green-500"><Wrench className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(i)}><Edit3 className="w-4 h-4 text-gray-400" /></button>
                                            <button onClick={() => handleDelete(i._id)} className="ml-auto"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {!readOnly && (
                <>
                    <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit' : 'Add Equipment'}>
                        <div className="space-y-3"><Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={['tractor','plough','sprayer','milking','incubator','feeder','waterer','tool','vehicle','other'].map((v) => ({ value: v, label: v }))} /><Input label="Cost (KES)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /><Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /><Select label="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} options={['new','good','fair','poor','broken'].map((v) => ({ value: v, label: v }))} /><Select label="Maintenance Frequency" value={form.maintenanceFrequency} onChange={(e) => setForm({ ...form, maintenanceFrequency: e.target.value })} options={['weekly','monthly','quarterly','biannually','annually'].map((v) => ({ value: v, label: v }))} /><div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></div></div>
                    </Modal>
                    <Modal open={!!maintModal} onClose={() => setMaintModal(null)} title="Record Maintenance" size="sm">
                        <div className="space-y-3"><Input label="Cost (KES)" type="number" value={maintForm.cost} onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })} /><Select label="Condition After" value={maintForm.condition} onChange={(e) => setMaintForm({ ...maintForm, condition: e.target.value })} options={['new','good','fair','poor','broken'].map((v) => ({ value: v, label: v }))} /><Input label="Notes" value={maintForm.notes} onChange={(e) => setMaintForm({ ...maintForm, notes: e.target.value })} /><Button onClick={handleMaintenance} className="w-full">Record Maintenance</Button></div>
                    </Modal>
                </>
            )}
        </div>
    );
}