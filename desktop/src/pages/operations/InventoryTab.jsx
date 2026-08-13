import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFarms } from '../../api/farms';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../api/inventory';
import { getStock, stockIn, stockOut, updateStock, deleteStock, getStockMovements } from '../../api/stock';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, Edit3, ArrowDown, ArrowUp, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryTab({ readOnly = false }) {
    const { user } = useAuth();
    const isFarmer = user?.role === 'farmer';

    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [view, setView] = useState('stock');
    const [items, setItems] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [stockQtyModal, setStockQtyModal] = useState(null);
    const [stockQty, setStockQty] = useState('');
    const [stockDir, setStockDir] = useState('in');
    const [movementsModal, setMovementsModal] = useState(null);
    const [movements, setMovements] = useState([]);
    const [form, setForm] = useState({ product: '', unit: 'piece', quantity: '', pricePerUnit: '', minimumStock: '', reason: '' });
    const [invForm, setInvForm] = useState({ name: '', category: 'feed', quantity: '', unit: 'kg', purchaseDate: '', expiryDate: '', cost: '', supplier: '', lowStockAlert: '' });

    useEffect(() => { if (!isFarmer && user?.farm) setFarmId(user.farm); }, [user]);
    useEffect(() => { if (isFarmer) getFarms().then((r) => setFarms(r.data.data.farms || [])); else if (user?.farm) setFarms([{ _id: user.farm, name: 'Assigned Farm' }]); }, [isFarmer, user]);
    useEffect(() => { if (farmId) { setLoading(true); const f = view === 'stock' ? getStock(farmId) : getInventory(farmId); f.then((r) => { setItems(r.data.data.items || []); setLowStock(r.data.data.lowStock || []); }).finally(() => setLoading(false)); } }, [farmId, view]);

    const openAdd = () => { setEditing(null); view === 'stock' ? setForm({ product: '', unit: 'piece', quantity: '', pricePerUnit: '', minimumStock: '', reason: '' }) : setInvForm({ name: '', category: 'feed', quantity: '', unit: 'kg', purchaseDate: '', expiryDate: '', cost: '', supplier: '', lowStockAlert: '' }); setShowModal(true); };
    const openEdit = (item) => { setEditing(item); view === 'stock' ? setForm({ product: item.product, unit: item.unit, quantity: item.quantity, pricePerUnit: item.pricePerUnit || '', minimumStock: item.minimumStock || '', reason: '' }) : setInvForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, purchaseDate: item.purchaseDate?.split('T')[0] || '', expiryDate: item.expiryDate?.split('T')[0] || '', cost: item.cost || '', supplier: item.supplier || '', lowStockAlert: item.lowStockAlert || '' }); setShowModal(true); };

    const handleSave = async () => { try { if (view === 'stock') { if (!form.product) return toast.error('Product required'); editing ? await updateStock(editing._id, { product: form.product, unit: form.unit, minimumStock: Number(form.minimumStock) || 0, pricePerUnit: Number(form.pricePerUnit) || 0 }) : await stockIn(farmId, { product: form.product, unit: form.unit, quantity: Number(form.quantity) || 0, pricePerUnit: Number(form.pricePerUnit) || 0, reason: form.reason || 'Manual' }); } else { if (!invForm.name) return toast.error('Name required'); editing ? await updateInventoryItem(editing._id, invForm) : await addInventoryItem(farmId, { ...invForm, quantity: Number(invForm.quantity), cost: Number(invForm.cost), lowStockAlert: Number(invForm.lowStockAlert) }); } toast.success(editing ? 'Updated' : 'Added'); setShowModal(false); const f = view === 'stock' ? getStock(farmId) : getInventory(farmId); f.then((r) => { setItems(r.data.data.items || []); setLowStock(r.data.data.lowStock || []); }); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
    const handleStockMove = async () => { const q = Number(stockQty); if (!q) return; try { stockDir === 'in' ? await stockIn(farmId, { product: stockQtyModal.product, unit: stockQtyModal.unit, quantity: q, reason: 'Adjustment' }) : await stockOut(farmId, { product: stockQtyModal.product, unit: stockQtyModal.unit, quantity: q, reason: 'Adjustment' }); toast.success('Done'); setStockQtyModal(null); getStock(farmId).then((r) => setItems(r.data.data.items || [])); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
    const handleDelete = async (id) => { if (confirm('Delete?')) { view === 'stock' ? await deleteStock(id) : await deleteInventoryItem(id); setItems((p) => p.filter((i) => i._id !== id)); toast.success('Deleted'); } };
    const openMovements = async (item) => { setMovementsModal(item); try { const r = await getStockMovements(item._id); setMovements(r.data.data.movements || []); } catch { setMovements([]); } };

    const isStock = view === 'stock';

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex gap-2">
                    {isFarmer ? <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" /> : <p className="text-sm font-medium text-gray-700 dark:text-gray-300">📍 {farms[0]?.name || 'Assigned Farm'}</p>}
                    <Select value={view} onChange={(e) => setView(e.target.value)} options={[{ value: 'stock', label: '📦 Prod Stock' }, { value: 'inventory', label: '🏗️ Inventory' }]} className="w-full sm:w-44" />
                </div>
                {!readOnly && farmId && <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add {isStock ? 'Stock' : 'Item'}</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : (
                <>
                    {lowStock.length > 0 && <Card title="⚠️ Low Stock">{lowStock.map((i) => <p key={i._id} className="text-sm text-orange-600">{isStock ? i.product : i.name}: {i.quantity} {i.unit} remaining</p>)}</Card>}
                    {items.length === 0 ? <EmptyState title={`No ${isStock ? 'stock' : 'inventory'} items`} /> : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((i) => (
                                <Card key={i._id}>
                                    <p className="font-bold">{isStock ? i.product : i.name}</p>
                                    <p className="text-sm text-gray-500">{i.quantity} {i.unit} {(i.pricePerUnit || i.cost) ? `· KES ${(i.pricePerUnit || i.cost || 0).toLocaleString()}/${i.unit}` : ''}</p>
                                    {!isStock && i.expiryDate && <p className="text-xs text-gray-400">Expires: {new Date(i.expiryDate).toLocaleDateString()}</p>}
                                    {isStock && <p className="text-xs text-gray-400">Value: KES {((i.quantity || 0) * (i.pricePerUnit || 0)).toLocaleString()}</p>}
                                    {!readOnly && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t">
                                            {isStock && <><button onClick={() => { setStockQtyModal(i); setStockQty(''); setStockDir('in'); }} className="text-gray-400 hover:text-green-500"><ArrowDown className="w-4 h-4" /></button><button onClick={() => { setStockQtyModal(i); setStockQty(''); setStockDir('out'); }} className="text-gray-400 hover:text-red-500"><ArrowUp className="w-4 h-4" /></button><button onClick={() => openMovements(i)} className="text-gray-400 hover:text-blue-500"><History className="w-4 h-4" /></button></>}
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
                    <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit' : `Add ${isStock ? 'Stock' : 'Item'}`}>
                        <div className="space-y-3">
                            {isStock ? (<><Input label="Product" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} /><Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />{!editing && <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />}<Input label="Price/Unit (KES)" type="number" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} /><Input label="Min Stock Alert" type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} /></>) : (<><Input label="Name" value={invForm.name} onChange={(e) => setInvForm({ ...invForm, name: e.target.value })} /><Select label="Category" value={invForm.category} onChange={(e) => setInvForm({ ...invForm, category: e.target.value })} options={['feed','medicine','fertilizer','pesticide','seeds','tools','other'].map((v) => ({ value: v, label: v }))} /><div className="grid grid-cols-2 gap-3"><Input label="Quantity" type="number" value={invForm.quantity} onChange={(e) => setInvForm({ ...invForm, quantity: e.target.value })} /><Input label="Unit" value={invForm.unit} onChange={(e) => setInvForm({ ...invForm, unit: e.target.value })} /></div><Input label="Cost (KES)" type="number" value={invForm.cost} onChange={(e) => setInvForm({ ...invForm, cost: e.target.value })} /><Input label="Supplier" value={invForm.supplier} onChange={(e) => setInvForm({ ...invForm, supplier: e.target.value })} /><Input label="Low Stock Alert" type="number" value={invForm.lowStockAlert} onChange={(e) => setInvForm({ ...invForm, lowStockAlert: e.target.value })} /><Input label="Expiry Date" type="date" value={invForm.expiryDate} onChange={(e) => setInvForm({ ...invForm, expiryDate: e.target.value })} /></>)}
                            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button></div>
                        </div>
                    </Modal>
                    <Modal open={!!stockQtyModal} onClose={() => setStockQtyModal(null)} title={`${stockDir === 'in' ? 'Stock In' : 'Stock Out'} — ${stockQtyModal?.product}`} size="sm">
                        <div className="space-y-3"><p className="text-sm text-gray-500">Current: {stockQtyModal?.quantity} {stockQtyModal?.unit}</p><Input label="Quantity" type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} /><Button onClick={handleStockMove} className="w-full">{stockDir === 'in' ? 'Add Stock' : 'Remove Stock'}</Button></div>
                    </Modal>
                </>
            )}

            <Modal open={!!movementsModal} onClose={() => setMovementsModal(null)} title={`Movements — ${movementsModal?.product}`} size="md">
                <div className="space-y-2">{movements.length === 0 ? <p className="text-gray-400 text-sm py-4 text-center">No movements</p> : (<table className="w-full text-sm"><thead><tr className="border-b"><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Qty</th><th className="px-3 py-2 text-left">Reason</th></tr></thead><tbody>{movements.map((m, i) => (<tr key={i} className="border-b"><td className="px-3 py-2">{new Date(m.date).toLocaleDateString('en-KE')}</td><td className={`px-3 py-2 font-medium ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>{m.type === 'in' ? '+' : '-'}</td><td className="px-3 py-2">{m.quantity}</td><td className="px-3 py-2">{m.reason || '—'}</td></tr>))}</tbody></table>)}</div>
            </Modal>
        </div>
    );
}