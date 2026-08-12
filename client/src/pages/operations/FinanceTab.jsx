import { useState, useEffect } from 'react';
import { getFarms } from '../../api/farms';
import { getTransactions, addTransaction, deleteTransaction, getTransactionSummary } from '../../api/transactions';
import { getPrices, setPrice, updatePrice, deletePrice, getSuggestedProducts } from '../../api/prices';
import { getStock, stockOut } from '../../api/stock';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Plus, Trash2, ArrowDown, Edit3, Receipt, X, ShoppingCart } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function FinanceTab() {
    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [prices, setPrices] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [cart, setCart] = useState([]);
    const [cartItem, setCartItem] = useState({ product: '', quantity: '1', pricePerUnit: '', discount: '0' });
    const [expenseForm, setExpenseForm] = useState({ category: 'inputs', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    const [priceForm, setPriceForm] = useState({ product: '', category: 'animal', unit: '', pricePerUnit: '', quality: 'grade_a' });

    const farm = farms.find((f) => f._id === farmId) || {};
    const farmName = farm.name || '';
    const farmLocation = farm.location?.county ? `${farm.location.county}${farm.location.subCounty ? ', ' + farm.location.subCounty : ''}` : '';

    useEffect(() => { getFarms().then((r) => setFarms(r.data.data.farms || [])); }, []);
    useEffect(() => {
        if (farmId) {
            setLoading(true);
            Promise.all([getTransactions(farmId), getTransactionSummary(farmId, 'month'), getPrices(farmId), getSuggestedProducts(farmId), getStock(farmId)])
                .then(([t, s, p, sug, st]) => {
                    setTransactions(t.data.data.transactions || []);
                    setSummary(s.data.data.summary);
                    setPrices(p.data.data.prices || []);
                    setSuggested(sug.data.data.suggested || []);
                    setStock(st.data.data.items || []);
                }).finally(() => setLoading(false));
        }
    }, [farmId]);

    const stockProducts = stock.map((s) => ({ ...s, label: `${s.product} (${s.quantity} ${s.unit} available)` }));

    const handleCartProductChange = (productId) => {
        const item = stock.find((s) => s._id === productId);
        if (item) {
            setCartItem({ ...cartItem, product: productId, pricePerUnit: item.pricePerUnit || '' });
        }
    };

    const addToCart = () => {
        const item = stock.find((s) => s._id === cartItem.product);
        if (!item) return toast.error('Select a product');
        const qty = Number(cartItem.quantity);
        if (!qty || qty <= 0) return toast.error('Enter quantity');
        if (qty > item.quantity) return toast.error(`Only ${item.quantity} available`);
        const ppu = Number(cartItem.pricePerUnit) || 0;
        const disc = Number(cartItem.discount) || 0;
        const total = ppu * qty - disc;

        const existing = cart.find((c) => c.productId === cartItem.product);
        if (existing) {
            const newQty = existing.quantity + qty;
            if (newQty > item.quantity) return toast.error(`Only ${item.quantity} available (${existing.quantity} already in cart)`);
            setCart(cart.map((c) => c.productId === cartItem.product ? { ...c, quantity: newQty, total: ppu * newQty - (Number(c.discount) || 0) } : c));
        } else {
            setCart([...cart, { productId: cartItem.product, product: item.product, unit: item.unit, quantity: qty, pricePerUnit: ppu, discount: disc, total: total > 0 ? total : 0 }]);
        }
        setCartItem({ product: '', quantity: '1', pricePerUnit: '', discount: '0' });
    };

    const removeFromCart = (idx) => setCart(cart.filter((_, i) => i !== idx));

    const cartTotal = cart.reduce((s, c) => s + c.total, 0);

const handleSale = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    try {
        const description = cart.map((c) => `${c.product} x${c.quantity} ${c.unit}`).join(', ');
        const totalDiscount = cart.reduce((s, c) => s + (Number(c.discount) || 0), 0);
        const desc = totalDiscount > 0 ? `${description} (disc: KES ${totalDiscount})` : description;

        await addTransaction(farmId, {
            type: 'income', category: 'sales',
            amount: cartTotal, date: new Date().toISOString().split('T')[0],
            description: desc,
        });

        for (const c of cart) {
            await stockOut(farmId, { product: c.product, unit: c.unit, quantity: c.quantity, reason: 'Sale' });
        }

        printCartReceipt();
        toast.success('Sale recorded');
        setCart([]);
        const [t, st] = await Promise.all([getTransactions(farmId), getStock(farmId)]);
        setTransactions(t.data.data.transactions || []);
        setStock(st.data.data.items || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
};

    const printCartReceipt = () => {
        const w = window.open('', '_blank', 'width=320,height=500');
        if (!w) return;
        const now = new Date();
        const itemsHTML = cart.map((c) => `
            <div class="row"><span>${c.product}</span><span>${c.quantity} ${c.unit}</span></div>
            <div class="row"><span>@ KES ${c.pricePerUnit.toLocaleString()}</span><span>KES ${(c.pricePerUnit * c.quantity).toLocaleString()}</span></div>
            ${c.discount > 0 ? `<div class="row"><span>Discount</span><span style="color:#dc2626">- KES ${c.discount.toLocaleString()}</span></div>` : ''}
        `).join('<div class="line"></div>');

        w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
            *{margin:0;padding:0;box-sizing:border-box} body{font-family:'Courier New',monospace;padding:16px;font-size:12px;width:300px;margin:0 auto;color:#1f2937}
            .center{text-align:center} h3{margin-bottom:2px;font-size:15px} .sub{font-size:11px;color:#6b7280}
            .line{border-top:1px dashed #d1d5db;margin:8px 0} .row{display:flex;justify-content:space-between;margin:3px 0} .bold{font-weight:bold}
            .total-row{background:#f0fdf4;padding:8px;border-radius:4px;margin-top:8px;font-size:14px}
            .footer{text-align:center;margin-top:12px;font-size:11px;color:#9ca3af} @media print{body{padding:10px}}
        </style></head><body>
            <div class="center"><h3>${farmName}</h3><p class="sub">${farmLocation}</p></div>
            <div class="line"></div><p>Date: ${now.toLocaleString('en-KE')}</p><p>Receipt #: ${Date.now().toString(36).toUpperCase().slice(-6)}</p>
            <div class="line"></div>${itemsHTML}<div class="line"></div>
            <div class="row total-row"><span class="bold">TOTAL</span><span class="bold">KES ${cartTotal.toLocaleString()}</span></div>
            <p class="footer">Thank you!<br>FarmVexa</p><script>window.print();</script></body></html>`);
        w.document.close();
    };

    const printTxnReceipt = (t) => {
        const w = window.open('', '_blank', 'width=320,height=400');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
            *{margin:0;padding:0;box-sizing:border-box} body{font-family:'Courier New',monospace;padding:16px;font-size:12px;width:300px;margin:0 auto;color:#1f2937}
            .center{text-align:center} h3{margin-bottom:2px;font-size:15px} .sub{font-size:11px;color:#6b7280}
            .line{border-top:1px dashed #d1d5db;margin:10px 0} .row{display:flex;justify-content:space-between;margin:4px 0} .bold{font-weight:bold}
            .total-row{background:#f0fdf4;padding:8px;border-radius:4px;margin-top:8px;font-size:14px} .footer{text-align:center;margin-top:12px;font-size:11px;color:#9ca3af}
            .income{color:#059669} .expense{color:#dc2626} @media print{body{padding:10px}}
        </style></head><body>
            <div class="center"><h3>${farmName}</h3><p class="sub">${farmLocation}</p></div>
            <div class="line"></div><p>Date: ${new Date(t.date).toLocaleString('en-KE')}</p><p>Receipt #: ${(t._id || '').slice(-6).toUpperCase()}</p>
            <div class="line"></div>
            <div class="row"><span>Type:</span><span class="bold ${t.type === 'income' ? 'income' : 'expense'}">${t.type?.toUpperCase()}</span></div>
            <div class="row"><span>Details:</span><span>${t.description || t.category || '—'}</span></div>
            <div class="line"></div>
            <div class="row total-row"><span class="bold">AMOUNT</span><span class="bold ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'} KES ${(t.amount || 0).toLocaleString()}</span></div>
            <p class="footer">FarmVexa</p><script>window.print();</script></body></html>`);
        w.document.close();
    };

    const handleExpense = async () => {
        if (!expenseForm.amount) return toast.error('Amount required');
        try { await addTransaction(farmId, { type: 'expense', ...expenseForm, amount: Number(expenseForm.amount) }); toast.success('Expense recorded'); setShowModal(false); setExpenseForm({ category: 'inputs', amount: '', date: new Date().toISOString().split('T')[0], description: '' }); getTransactions(farmId).then((t) => setTransactions(t.data.data.transactions || [])); getTransactionSummary(farmId, 'month').then((s) => setSummary(s.data.data.summary)); }
        catch { toast.error('Failed'); }
    };

    const handleDelete = async (id) => { if (confirm('Delete?')) { await deleteTransaction(id); setTransactions((p) => p.filter((t) => t._id !== id)); toast.success('Deleted'); } };
    const handleAddSuggested = async (item) => { try { await setPrice(farmId, { ...item, pricePerUnit: item.defaultPrice || 0 }); toast.success(`Added ${item.product}`); const [p, sug] = await Promise.all([getPrices(farmId), getSuggestedProducts(farmId)]); setPrices(p.data.data.prices || []); setSuggested(sug.data.data.suggested || []); } catch { toast.error('Failed'); } };
    const handleEditPrice = (p) => { setEditingPrice(p); setPriceForm({ product: p.product, category: p.category, unit: p.unit, pricePerUnit: p.pricePerUnit, quality: p.quality || 'grade_a' }); };
    const handleUpdatePrice = async () => { if (!editingPrice) return; try { await updatePrice(editingPrice._id, priceForm); toast.success('Updated'); setEditingPrice(null); const p = await getPrices(farmId); setPrices(p.data.data.prices || []); } catch { toast.error('Failed'); } };
    const handleDeletePrice = async (id) => { if (confirm('Delete?')) { await deletePrice(id); setPrices((p) => p.filter((x) => x._id !== id)); toast.success('Deleted'); } };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" />
                {farmId && <Button onClick={() => setShowModal(true)} variant="outline" size="sm"><ArrowDown className="w-4 h-4" /> Expense</Button>}
            </div>

            {!farmId ? <EmptyState title="Select a farm" /> : loading ? <Spinner /> : (
                <>
                    {summary && (
                        <div className="grid grid-cols-3 gap-3">
                            <Card><p className="text-lg font-bold text-green-600">KES {(summary.income || 0).toLocaleString()}</p><p className="text-xs text-gray-500">Income</p></Card>
                            <Card><p className="text-lg font-bold text-red-600">KES {(summary.expense || 0).toLocaleString()}</p><p className="text-xs text-gray-500">Expense</p></Card>
                            <Card><p className={`text-lg font-bold ${(summary.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>KES {(summary.net || 0).toLocaleString()}</p><p className="text-xs text-gray-500">Net</p></Card>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Cart Panel */}
                        <Card title="🛒 Sale Cart">
                            <div className="space-y-3">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1"><Select label="Product" value={cartItem.product} onChange={(e) => handleCartProductChange(e.target.value)} options={stockProducts.map((s) => ({ value: s._id, label: s.label }))} /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input label="Qty" type="number" value={cartItem.quantity} onChange={(e) => setCartItem({ ...cartItem, quantity: e.target.value })} />
                                    <Input label="Price (KES)" type="number" value={cartItem.pricePerUnit} onChange={(e) => setCartItem({ ...cartItem, pricePerUnit: e.target.value })} />
                                    <Input label="Disc (KES)" type="number" value={cartItem.discount} onChange={(e) => setCartItem({ ...cartItem, discount: e.target.value })} />
                                </div>
                                <Button onClick={addToCart} variant="outline" className="w-full"><Plus className="w-4 h-4" /> Add to Cart</Button>

                                {cart.length > 0 && (
                                    <div className="border rounded-lg divide-y">
                                        {cart.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 text-sm">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{c.product}</p>
                                                    <p className="text-xs text-gray-500">{c.quantity} {c.unit} x KES {c.pricePerUnit.toLocaleString()} {c.discount > 0 ? `(−KES ${c.discount})` : ''}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">KES {c.total.toLocaleString()}</span>
                                                    <button onClick={() => removeFromCart(i)} className="text-red-500"><X className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20 font-bold">
                                            <span>Total</span><span>KES {cartTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <Button onClick={handleSale} disabled={cart.length === 0} className="w-full"><ShoppingCart className="w-4 h-4" /> Complete Sale ({cart.length} items)</Button>
                            </div>
                        </Card>

                        {/* Pricing */}
                        <Card title="🏷️ Pricing">
                            {suggested.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-1">
                                    {suggested.map((s, i) => (<button key={i} onClick={() => handleAddSuggested(s)} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-xs rounded-full">+ {s.product}</button>))}
                                </div>
                            )}
                            {prices.length === 0 ? <p className="text-gray-400 text-sm py-2">No prices set</p> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs"><thead><tr className="border-b"><th className="py-1 text-left text-gray-500">Product</th><th className="py-1 text-left text-gray-500">Price</th><th className="py-1 text-right"></th></tr></thead>
                                        <tbody>{prices.map((p) => (<tr key={p._id} className="border-b"><td className="py-1">{p.product}</td><td className="py-1">KES {p.pricePerUnit}/{p.unit}</td><td className="py-1 text-right"><button onClick={() => handleEditPrice(p)} className="mr-1"><Edit3 className="w-3 h-3" /></button><button onClick={() => handleDeletePrice(p._id)}><Trash2 className="w-3 h-3 text-red-500" /></button></td></tr>))}</tbody></table>
                                </div>
                            )}
                        </Card>
                    </div>

                    {transactions.length > 0 && (
                        <Card title="Recent Transactions">
                            <div className="space-y-1">
                                {transactions.slice(0, 30).map((t) => (
                                    <div key={t._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`shrink-0 w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="font-medium truncate">{t.description || t.category}</span>
                                            <span className="text-xs text-gray-400 hidden sm:inline">{formatDate(t.date, 'date')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'} KES {t.amount.toLocaleString()}</span>
                                            <button onClick={() => printTxnReceipt(t)} className="text-gray-400 hover:text-blue-500"><Receipt className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Expense" size="sm">
                <div className="space-y-3">
                    <Select label="Category" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} options={['inputs','labour','vet','transport','equipment','other'].map((v) => ({ value: v, label: v }))} />
                    <Input label="Amount (KES)" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                    <Input label="Date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                    <Input label="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                    <Button onClick={handleExpense} className="w-full">Save Expense</Button>
                </div>
            </Modal>

            <Modal open={!!editingPrice} onClose={() => setEditingPrice(null)} title="Edit Price" size="sm">
                <div className="space-y-3">
                    <Input label="Product" value={priceForm.product} disabled />
                    <Input label="Price per Unit (KES)" type="number" value={priceForm.pricePerUnit} onChange={(e) => setPriceForm({ ...priceForm, pricePerUnit: e.target.value })} />
                    <Button onClick={handleUpdatePrice} className="w-full">Update</Button>
                </div>
            </Modal>
        </div>
    );
}