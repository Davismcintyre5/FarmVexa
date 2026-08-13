import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getTeam, addTeamMember, updateTeamMember, toggleTeamMember, deleteTeamMember } from '../../api/team';
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } from '../../api/tasks';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, Edit3, Phone, Mail, Check, Users, CheckSquare } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function TeamTasksTab({ readOnly = false }) {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';
    const canManageTeam = user?.role === 'farmer';
    const canManageTasks = ['farmer', 'manager'].includes(user?.role);

    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('team');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [modalType, setModalType] = useState('member');
    const [memberForm, setMemberForm] = useState({ name: '', role: 'worker', phone: '', email: '', salary: '', hireDate: '' });
    const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });

    useEffect(() => { if (!isFarmer && user?.farm) setFarmId(user.farm); }, [user]);
    useEffect(() => { if (isFarmer) getFarms().then((r) => setFarms(r.data.data.farms || [])); else if (user?.farm) setFarms([{ _id: user.farm, name: 'Assigned Farm' }]); }, [isFarmer, user]);
    useEffect(() => {
        if (farmId) {
            setLoading(true);
            Promise.all([getTeam(farmId), getTasks(farmId)])
                .then(([tm, ts]) => { setMembers(tm.data.data.members || []); setTasks(ts.data.data.tasks || []); })
                .finally(() => setLoading(false));
        }
    }, [farmId]);

    const openAddMember = () => { setEditing(null); setModalType('member'); setMemberForm({ name: '', role: 'worker', phone: '', email: '', salary: '', hireDate: '' }); setShowModal(true); };
    const openEditMember = (m) => { setEditing(m); setModalType('member'); setMemberForm({ name: m.name, role: m.role, phone: m.phone || '', email: m.email || '', salary: m.salary || '', hireDate: m.hireDate?.split('T')[0] || '' }); setShowModal(true); };

    const openAddTask = () => { setEditing(null); setModalType('task'); setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' }); setShowModal(true); };
    const openEditTask = (t) => { setEditing(t); setModalType('task'); setTaskForm({ title: t.title, description: t.description || '', assignedTo: t.assignedTo?._id || '', priority: t.priority, dueDate: t.dueDate?.split('T')[0] || '' }); setShowModal(true); };

    const handleSave = async () => {
        try {
            if (modalType === 'member') {
                if (!memberForm.name) return toast.error('Name required');
                if (editing) { await updateTeamMember(editing._id, memberForm); toast.success('Member updated'); }
                else { await addTeamMember(farmId, { ...memberForm, salary: Number(memberForm.salary) }); toast.success('Member added'); }
            } else {
                if (!taskForm.title) return toast.error('Title required');
                if (editing) { await updateTask(editing._id, taskForm); toast.success('Task updated'); }
                else { await createTask(farmId, taskForm); toast.success('Task created'); }
            }
            setShowModal(false);
            const [tm, ts] = await Promise.all([getTeam(farmId), getTasks(farmId)]);
            setMembers(tm.data.data.members || []);
            setTasks(ts.data.data.tasks || []);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleToggleMember = async (id) => { await toggleTeamMember(id); const tm = await getTeam(farmId); setMembers(tm.data.data.members || []); };
    const handleDeleteMember = async (id) => { if (confirm('Delete member?')) { await deleteTeamMember(id); setMembers((p) => p.filter((m) => m._id !== id)); toast.success('Deleted'); } };
    const handleTaskStatus = async (id, status) => { await updateTaskStatus(id, status); const ts = await getTasks(farmId); setTasks(ts.data.data.tasks || []); toast.success(status === 'completed' ? 'Completed!' : 'Updated'); };
    const handleDeleteTask = async (id) => { if (confirm('Delete task?')) { await deleteTask(id); setTasks((p) => p.filter((t) => t._id !== id)); toast.success('Deleted'); } };

    const priorityColors = { low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' };
    const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const completedTasks = tasks.filter((t) => t.status === 'completed');

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {isFarmer ? <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" /> : <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>}
            </div>

            {/* Tab Switch */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('team')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'team' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'}`}>
                    <Users className="w-4 h-4" /> Team ({members.length})
                </button>
                <button onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'tasks' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500'}`}>
                    <CheckSquare className="w-4 h-4" /> Tasks ({pendingTasks.length})
                </button>
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : (
                <>
                    {/* TEAM TAB */}
                    {activeTab === 'team' && (
                        <div className="space-y-4">
                            {canManageTeam && !readOnly && (
                                <div className="flex justify-end">
                                    <Button onClick={openAddMember}><Plus className="w-4 h-4" /> Add Member</Button>
                                </div>
                            )}
                            {members.length === 0 ? <EmptyState title="No team members" /> : (
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
                                            {canManageTeam && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t">
                                                    <button onClick={() => openEditMember(m)}><Edit3 className="w-4 h-4 text-gray-400" /></button>
                                                    <button onClick={() => handleToggleMember(m._id)} className="text-xs text-gray-400 hover:text-primary-500">{m.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                                                    <button onClick={() => handleDeleteMember(m._id)} className="ml-auto"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            {canManageTasks && !readOnly && (
                                <div className="flex justify-end">
                                    <Button onClick={openAddTask}><Plus className="w-4 h-4" /> Add Task</Button>
                                </div>
                            )}
                            {tasks.length === 0 ? <EmptyState title="No tasks" /> : (
                                <>
                                    {pendingTasks.length > 0 && (
                                        <Card title="Pending Tasks">
                                            {pendingTasks.map((t) => (
                                                <div key={t._id} className="flex items-center justify-between py-2 border-b last:border-0">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                                                            <span className="font-medium truncate">{t.title}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5">{t.assignedTo?.name || 'Unassigned'} · Due: {t.dueDate ? formatDate(t.dueDate, 'date') : 'No date'}</p>
                                                    </div>
                                                    {canManageTasks && !readOnly && (
                                                        <div className="flex gap-1 flex-shrink-0 ml-2">
                                                            {t.status === 'pending' && <button onClick={() => handleTaskStatus(t._id, 'in_progress')} className="text-xs text-blue-500 px-1">Start</button>}
                                                            <button onClick={() => handleTaskStatus(t._id, 'completed')} className="text-green-500"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => openEditTask(t)}><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                                                            <button onClick={() => handleDeleteTask(t._id)}><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </Card>
                                    )}
                                    {completedTasks.length > 0 && (
                                        <Card title="Completed">
                                            {completedTasks.map((t) => (
                                                <div key={t._id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                                                    <span className="line-through text-gray-400">{t.title}</span>
                                                    <span className="text-xs text-gray-400">{t.assignedTo?.name || 'Unassigned'}</span>
                                                </div>
                                            ))}
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={modalType === 'member' ? (editing ? 'Edit Member' : 'Add Member') : (editing ? 'Edit Task' : 'Add Task')} size="lg">
                <div className="space-y-3">
                    {modalType === 'member' ? (
                        <>
                            <Input label="Name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
                            <Select label="Role" value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} options={['worker','vet','manager','other'].map((v) => ({ value: v, label: v }))} />
                            <Input label="Phone" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
                            <Input label="Email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
                            <Input label="Salary (KES)" type="number" value={memberForm.salary} onChange={(e) => setMemberForm({ ...memberForm, salary: e.target.value })} />
                            <Input label="Hire Date" type="date" value={memberForm.hireDate} onChange={(e) => setMemberForm({ ...memberForm, hireDate: e.target.value })} />
                        </>
                    ) : (
                        <>
                            <Input label="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                            <Input label="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                            <Select label="Assign To" value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} options={members.map((m) => ({ value: m._id, label: m.name }))} />
                            <Select label="Priority" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} options={['low','medium','high','urgent'].map((v) => ({ value: v, label: v }))} />
                            <Input label="Due Date" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                        </>
                    )}
                    <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></div>
                </div>
            </Modal>
        </div>
    );
}