import { useState, useEffect } from 'react';
import { getFarms } from '../../api/farms';
import { getTeam } from '../../api/team';
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } from '../../api/tasks';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, Edit3, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function TasksTab({ readOnly = false }) {
    const [farms, setFarms] = useState([]);
    const [team, setTeam] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', recurrence: 'none' });

    useEffect(() => { getFarms().then((r) => setFarms(r.data.data.farms || [])); }, []);
    useEffect(() => { if (farmId) { setLoading(true); Promise.all([getTasks(farmId), getTeam(farmId)]).then(([t, tm]) => { setTasks(t.data.data.tasks || []); setTeam(tm.data.data.members || []); }).finally(() => setLoading(false)); } }, [farmId]);

    const openAdd = () => { setEditing(null); setForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', recurrence: 'none' }); setShowModal(true); };
    const openEdit = (t) => { setEditing(t); setForm({ title: t.title, description: t.description || '', assignedTo: t.assignedTo?._id || '', priority: t.priority, dueDate: t.dueDate?.split('T')[0] || '', recurrence: t.recurrence || 'none' }); setShowModal(true); };

    const handleSave = async () => { if (!form.title) return toast.error('Title required'); try { editing ? await updateTask(editing._id, form) : await createTask(farmId, form); toast.success(editing ? 'Updated' : 'Created'); setShowModal(false); getTasks(farmId).then((r) => setTasks(r.data.data.tasks || [])); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
    const handleStatus = async (id, status) => { await updateTaskStatus(id, status); getTasks(farmId).then((r) => setTasks(r.data.data.tasks || [])); toast.success(status === 'completed' ? 'Completed!' : 'Updated'); };
    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteTask(id); setTasks((p) => p.filter((t) => t._id !== id)); toast.success('Deleted'); } };

    const priorityColors = { low: 'bg-blue-100 text-blue-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' };
    const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" />
                {!readOnly && farmId && <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Task</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : tasks.length === 0 ? <EmptyState title="No tasks" /> : (
                <>
                    {pending.length > 0 && (
                        <Card title="Pending Tasks">
                            {pending.map((t) => (
                                <div key={t._id} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[t.priority]}`}>{t.priority}</span><span className="font-medium truncate">{t.title}</span></div>
                                        <p className="text-xs text-gray-400 mt-0.5">{t.assignedTo?.name || 'Unassigned'} · Due: {t.dueDate ? formatDate(t.dueDate, 'date') : 'No date'}</p>
                                    </div>
                                    {!readOnly && (
                                        <div className="flex gap-1 flex-shrink-0 ml-2">
                                            {t.status === 'pending' && <button onClick={() => handleStatus(t._id, 'in_progress')} className="text-xs text-blue-500 px-1">Start</button>}
                                            <button onClick={() => handleStatus(t._id, 'completed')} className="text-green-500"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(t)}><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                                            <button onClick={() => handleDelete(t._id)}><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Card>
                    )}
                </>
            )}

            {!readOnly && (
                <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Task' : 'Add Task'}>
                    <div className="space-y-3"><Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><Select label="Assign To" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} options={team.map((m) => ({ value: m._id, label: m.name }))} /><Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={['low','medium','high','urgent'].map((v) => ({ value: v, label: v }))} /><Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /><div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></div></div>
                </Modal>
            )}
        </div>
    );
}