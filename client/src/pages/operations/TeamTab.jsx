import { useState, useEffect } from 'react';
import { getFarms } from '../../api/farms';
import { getTeam, addTeamMember, updateTeamMember, toggleTeamMember, deleteTeamMember } from '../../api/team';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, Edit3, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamTab() {
    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', role: 'worker', phone: '', email: '', salary: '', hireDate: '' });

    useEffect(() => { getFarms().then((r) => setFarms(r.data.data.farms || [])); }, []);
    useEffect(() => { if (farmId) { setLoading(true); getTeam(farmId).then((r) => setMembers(r.data.data.members || [])).finally(() => setLoading(false)); } }, [farmId]);

    const openAdd = () => { setEditing(null); setForm({ name: '', role: 'worker', phone: '', email: '', salary: '', hireDate: '' }); setShowModal(true); };
    const openEdit = (m) => { setEditing(m); setForm({ name: m.name, role: m.role, phone: m.phone || '', email: m.email || '', salary: m.salary || '', hireDate: m.hireDate?.split('T')[0] || '' }); setShowModal(true); };

    const handleSave = async () => {
        if (!form.name) return toast.error('Name required');
        try { if (editing) { await updateTeamMember(editing._id, form); toast.success('Updated'); } else { await addTeamMember(farmId, { ...form, salary: Number(form.salary) }); toast.success('Added'); } setShowModal(false); getTeam(farmId).then((r) => setMembers(r.data.data.members || [])); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    const handleToggle = async (id) => { await toggleTeamMember(id); getTeam(farmId).then((r) => setMembers(r.data.data.members || [])); };
    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteTeamMember(id); setMembers((p) => p.filter((m) => m._id !== id)); toast.success('Deleted'); } };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" />
                {farmId && <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Member</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : members.length === 0 ? <EmptyState title="No team members" /> : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((m) => (
                        <Card key={m._id}>
                            <div className="flex justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">{m.name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{m.role}</p>
                                    {m.phone && <p className="text-sm flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</p>}
                                    {m.email && <p className="text-sm flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{m.email}</p>}
                                    {m.salary && <p className="text-sm text-gray-500">KES {m.salary.toLocaleString()}/mo</p>}
                                </div>
                                <Badge status={m.status} />
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                                <button onClick={() => openEdit(m)}><Edit3 className="w-4 h-4 text-gray-400" /></button>
                                <button onClick={() => handleToggle(m._id)} className="text-xs text-gray-400 hover:text-primary-500">{m.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                                <button onClick={() => handleDelete(m._id)} className="ml-auto"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Member' : 'Add Member'}>
                <div className="space-y-3">
                    <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={['worker','vet','manager','other'].map((v) => ({ value: v, label: v }))} />
                    <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <Input label="Salary (KES)" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                    <Input label="Hire Date" type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
                    <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></div>
                </div>
            </Modal>
        </div>
    );
}