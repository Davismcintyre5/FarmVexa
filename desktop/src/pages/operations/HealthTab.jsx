import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getAnimals } from '../../api/animals';
import { getHealthRecords, addHealthRecord, updateHealthRecord, deleteHealthRecord, getUpcomingVaccinations } from '../../api/health';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, Edit3, Shield } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function HealthTab({ readOnly = false }) {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';
    const canAccess = ['farmer', 'vet', 'manager'].includes(user?.role);

    const [farms, setFarms] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [records, setRecords] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ animal: '', recordType: 'vaccination', date: new Date().toISOString().split('T')[0], description: '', diagnosis: '', treatment: '', medication: '', dosage: '', cost: '', vetName: '', vetContact: '', nextCheckup: '' });

    useEffect(() => { if (!isFarmer && user?.farm) setFarmId(user.farm); }, [user]);
    useEffect(() => { if (isFarmer) getFarms().then((r) => setFarms(r.data.data.farms || [])); else if (user?.farm) setFarms([{ _id: user.farm, name: 'Assigned Farm' }]); }, [isFarmer, user]);
    useEffect(() => { if (farmId && canAccess) { setLoading(true); Promise.all([getAnimals(farmId), getHealthRecords(farmId), getUpcomingVaccinations(farmId)]).then(([a, r, u]) => { setAnimals(a.data.data.animals || []) ; setRecords(r.data.data.records || []); setUpcoming(u.data.data.upcoming || []); }).finally(() => setLoading(false)); } }, [farmId, canAccess]);

    const openAdd = () => { setEditing(null); setForm({ animal: '', recordType: 'vaccination', date: new Date().toISOString().split('T')[0], description: '', diagnosis: '', treatment: '', medication: '', dosage: '', cost: '', vetName: '', vetContact: '', nextCheckup: '' }); setShowModal(true); };
    const openEdit = (r) => { setEditing(r); setForm({ animal: r.animal?._id || '', recordType: r.recordType, date: r.date?.split('T')[0] || '', description: r.description || '', diagnosis: r.diagnosis || '', treatment: r.treatment || '', medication: r.medication || '', dosage: r.dosage || '', cost: r.cost || '', vetName: r.vetName || '', vetContact: r.vetContact || '', nextCheckup: r.nextCheckup?.split('T')[0] || '' }); setShowModal(true); };

    const handleSave = async () => { if (!form.animal || !form.date) return toast.error('Animal and date required'); try { if (editing) { await updateHealthRecord(editing._id, form); toast.success('Updated'); } else { await addHealthRecord(farmId, form); toast.success('Added'); } setShowModal(false); getHealthRecords(farmId).then((r) => setRecords(r.data.data.records || [])); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteHealthRecord(id); setRecords((p) => p.filter((r) => r._id !== id)); toast.success('Deleted'); } };

    const typeColors = { vaccination: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', treatment: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', checkup: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', disease: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', deworming: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' };

    if (!canAccess) {
        return (
            <EmptyState
                icon={Shield}
                title="Health Records"
                description="This section is accessible by farm owners, managers, and veterinarians only."
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {isFarmer ? <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" /> : <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>}
                {!readOnly && farmId && <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Record</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : (
                <>
                    {upcoming.length > 0 && (
                        <Card title="⚠️ Upcoming Vaccinations">
                            {upcoming.map((r) => (<div key={r._id} className="flex justify-between py-1 text-sm"><span>{r.animal?.name || r.animal?.tagId} — {r.medication}</span><span className="text-orange-500">{formatDate(r.nextCheckup, 'date')}</span></div>))}
                        </Card>
                    )}
                    {records.length === 0 ? <EmptyState title="No health records" /> : (
                        <div className="space-y-2">
                            {records.map((r) => (
                                <Card key={r._id}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[r.recordType]}`}>{r.recordType}</span>
                                                <span className="font-medium truncate">{r.animal?.name || r.animal?.tagId}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{r.description || r.diagnosis} {r.cost ? `· KES ${r.cost}` : ''}</p>
                                            <p className="text-xs text-gray-400">{formatDate(r.date)}</p>
                                        </div>
                                        {!readOnly && (
                                            <div className="flex gap-1 flex-shrink-0 ml-2">
                                                <button onClick={() => openEdit(r)}><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                                                <button onClick={() => handleDelete(r._id)}><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {!readOnly && (
                <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Record' : 'Add Health Record'} size="lg">
                    <div className="space-y-3">
                        <Select label="Animal" value={form.animal} onChange={(e) => setForm({ ...form, animal: e.target.value })} options={animals.map((a) => ({ value: a._id, label: a.name || a.tagId }))} />
                        <Select label="Type" value={form.recordType} onChange={(e) => setForm({ ...form, recordType: e.target.value })} options={['vaccination','treatment','checkup','disease','deworming'].map((v) => ({ value: v, label: v }))} />
                        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        <Input label="Medication" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} />
                        <Input label="Dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
                        <Input label="Cost (KES)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                        <Input label="Vet Name" value={form.vetName} onChange={(e) => setForm({ ...form, vetName: e.target.value })} />
                        <Input label="Next Checkup" type="date" value={form.nextCheckup} onChange={(e) => setForm({ ...form, nextCheckup: e.target.value })} />
                        <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></div>
                    </div>
                </Modal>
            )}
        </div>
    );
}