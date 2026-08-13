import { useState, useEffect, useCallback } from 'react';
import { getFarms } from '../../api/farms';
import { getReport } from '../../api/reports';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Printer } from 'lucide-react';

const reportTypes = [
    { key: 'general', label: '📊 General' },
    { key: 'stock', label: '📦 Stock' },
    { key: 'livestock', label: '🐄 Livestock' },
    { key: 'production', label: '🥚 Production' },
    { key: 'crops', label: '🌾 Crops' },
    { key: 'financial', label: '💰 Financial' },
    { key: 'vaccination', label: '💉 Vaccination' },
    { key: 'inventory', label: '🏗️ Inventory' },
    { key: 'tasks', label: '✅ Tasks' },
];

const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
];

export default function ReportsTab() {
    const [farms, setFarms] = useState([]);
    const [farmId, setFarmId] = useState('');
    const [reportType, setReportType] = useState('general');
    const [period, setPeriod] = useState('month');
    const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [data, setData] = useState({ items: [], summary: {} });
    const [loading, setLoading] = useState(false);

    const farm = farms.find((f) => f._id === farmId) || {};
    const farmName = farm.name || '';
    const farmLocation = farm.location?.county ? `${farm.location.county}${farm.location.subCounty ? ', ' + farm.location.subCounty : ''}` : '';

    useEffect(() => { getFarms().then((r) => setFarms(r.data.data.farms || [])).catch(() => {}); }, []);

    const fetchReport = useCallback(async () => {
        if (!farmId) return;
        setLoading(true);
        try {
            const params = { type: reportType };
            if (period === 'custom' || reportType === 'production' || reportType === 'financial') {
                params.startDate = startDate;
                params.endDate = endDate;
            }
            const r = await getReport(farmId, params);
            setData({ items: r.data.data.items || [], summary: r.data.data.summary || {} });
        } catch { setData({ items: [], summary: {} }); }
        finally { setLoading(false); }
    }, [farmId, reportType, period, startDate, endDate]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    const handlePrint = () => {
        const w = window.open('', '_blank');
        if (!w) return;
        const title = reportTypes.find((r) => r.key === reportType)?.label || 'Report';
        const now = new Date();
        const ds = now.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
        const rangeStr = period === 'custom' ? `${startDate} — ${endDate}` : periodOptions.find((p) => p.value === period)?.label || '';
        const items = data.items || [];
        const s = data.summary || {};
        const entries = Object.entries(s).filter(([k]) => k !== 'byType');
        const sumHTML = entries.length === 0 ? '' : `<div class="summary">${entries.map(([k, v]) => `<div class="summary-card"><div class="label">${k.replace(/([A-Z])/g, ' $1').trim()}</div><div class="value">${typeof v === 'number' ? v.toLocaleString() : (v || 0)}</div></div>`).join('')}</div>`;

        const safe = (v) => v ?? '—';
        const num = (v) => typeof v === 'number' ? v.toLocaleString() : (v || '0');
        const date = (v) => v ? new Date(v).toLocaleDateString('en-KE') : '—';

        let tbl = '';
        switch (reportType) {
            case 'general': tbl = ''; break;
            case 'stock': tbl = `<table><thead><tr><th>Product</th><th>Unit</th><th>Qty</th><th>Price/Unit</th><th>Value</th><th>Min Stock</th></tr></thead><tbody>${items.map((i) => `<tr><td>${i.product}</td><td>${i.unit}</td><td>${i.quantity}</td><td>${i.pricePerUnit ? num(i.pricePerUnit) : '—'}</td><td>KES ${num((i.quantity || 0) * (i.pricePerUnit || 0))}</td><td>${i.minimumStock || '—'}</td></tr>`).join('')}</tbody></table>`; break;
            case 'livestock': tbl = `<table><thead><tr><th>Tag</th><th>Type</th><th>Breed</th><th>Details</th><th>Gender</th><th>Weight</th><th>Status</th></tr></thead><tbody>${items.map((a) => `<tr><td>${a.isBatch ? (a.batchName || a.tagId) : a.tagId}</td><td>${a.type}${a.isBatch ? ' (Batch)' : ''}</td><td>${safe(a.breed)}</td><td>${a.isBatch ? `${a.batchCurrent || 0}/${a.batchQuantity || 0} birds` : safe(a.category)}</td><td>${a.isBatch ? '—' : safe(a.gender)}</td><td>${a.isBatch ? '—' : (a.weight ? a.weight + 'kg' : '—')}</td><td>${a.status}</td></tr>`).join('')}</tbody></table>`; break;
            case 'production': tbl = `<table><thead><tr><th>Date</th><th>Type</th><th>Animal</th><th>Qty</th><th>Unit</th><th>Quality</th><th>Value</th></tr></thead><tbody>${items.map((r) => `<tr><td>${date(r.date)}</td><td>${r.type}</td><td>${r.animal?.tagId || '—'}</td><td>${r.quantity}</td><td>${r.unit}</td><td>${safe(r.quality)}</td><td>${r.totalValue ? num(r.totalValue) : '—'}</td></tr>`).join('')}</tbody></table>`; break;
            case 'crops': tbl = `<table><thead><tr><th>Field</th><th>Crop</th><th>Size</th><th>Soil</th><th>Status</th></tr></thead><tbody>${items.map((f) => `<tr><td>${f.name}</td><td>${safe(f.crop)}</td><td>${f.size?.value ? f.size.value + ' ' + f.size.unit : '—'}</td><td>${safe(f.soilType)}</td><td>${f.status}</td></tr>`).join('')}</tbody></table>`; break;
            case 'financial': tbl = `<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>${items.map((r) => `<tr><td>${date(r.date)}</td><td>${r.type}</td><td>${r.category}</td><td>${safe(r.description)}</td><td style="color:${r.type === 'income' ? '#059669' : '#dc2626'}">${r.type === 'income' ? '+' : '-'} KES ${num(r.amount)}</td></tr>`).join('')}</tbody></table>`; break;
            case 'vaccination': tbl = `<table><thead><tr><th>Date</th><th>Animal</th><th>Vaccine</th><th>Dosage</th><th>Vet</th><th>Next</th></tr></thead><tbody>${items.map((r) => `<tr><td>${date(r.date)}</td><td>${r.animal?.tagId || '—'}</td><td>${safe(r.medication)}</td><td>${safe(r.dosage)}</td><td>${safe(r.vetName)}</td><td>${r.nextCheckup ? date(r.nextCheckup) : '—'}</td></tr>`).join('')}</tbody></table>`; break;
            case 'inventory': tbl = `<table><thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Unit</th><th>Cost</th><th>Value</th></tr></thead><tbody>${items.map((i) => `<tr><td>${i.name}</td><td>${i.category}</td><td>${i.quantity}</td><td>${i.unit}</td><td>${i.cost ? num(i.cost) : '—'}</td><td>${i.cost ? num((i.quantity || 0) * i.cost) : '—'}</td></tr>`).join('')}</tbody></table>`; break;
            case 'tasks': tbl = `<table><thead><tr><th>Task</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead><tbody>${items.map((t) => `<tr><td>${t.title}</td><td>${t.assignedTo?.name || '—'}</td><td>${t.priority}</td><td>${t.dueDate ? date(t.dueDate) : '—'}</td><td>${(t.status || '').replace('_', ' ')}</td></tr>`).join('')}</tbody></table>`; break;
        }

        w.document.write(`<!DOCTYPE html><html><head><title>${title} — ${farmName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:30px;color:#1f2937}.header{margin-bottom:24px;border-bottom:3px solid #2d6a4f;padding-bottom:16px}.header h1{font-size:24px;color:#2d6a4f}.header .farm{font-size:16px;font-weight:600}.header .meta{font-size:13px;color:#6b7280;margin-top:4px}.summary{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}.summary-card{flex:1;min-width:120px;text-align:center;padding:16px;border:1px solid #e5e7eb;border-radius:8px}.summary-card .label{font-size:11px;color:#6b7280;text-transform:uppercase}.summary-card .value{font-size:28px;font-weight:700;margin-top:4px;color:#2d6a4f}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f3f4f6;text-align:left;padding:10px 12px;border-bottom:2px solid #d1d5db;font-size:12px;text-transform:uppercase;color:#6b7280}td{padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:24px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px}@media print{body{padding:20px}}</style></head><body><div class="header"><h1>${title}</h1><div class="farm">${farmName}</div><div class="farm">${farmLocation}</div><div class="meta">${rangeStr ? 'Period: ' + rangeStr : ''}${rangeStr && ds ? ' • ' : ''}Generated: ${ds}</div></div>${sumHTML}${tbl}<div class="footer"><p>Generated by FarmVexa on ${ds}</p><p>FarmVexa — See. Sense. Predict. Grow.</p></div></body></html>`);
        w.document.close();
        w.onload = () => { w.print(); w.onafterprint = () => w.close(); };
    };

    const isCustom = period === 'custom';
    const s = data.summary || {};

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={farmId} onChange={(e) => setFarmId(e.target.value)} options={farms.map((f) => ({ value: f._id, label: f.name }))} className="w-full sm:w-48" />
                    <Select value={reportType} onChange={(e) => setReportType(e.target.value)} options={reportTypes.map((r) => ({ value: r.key, label: r.label }))} className="w-full sm:w-48" />
                    <Select value={period} onChange={(e) => setPeriod(e.target.value)} options={periodOptions} className="w-full sm:w-40" />
                </div>
                {farmId && data.items?.length > 0 && <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4" /> Print</Button>}
            </div>

            {isCustom && (
                <div className="flex gap-3 no-print">
                    <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
            )}

            {!farmId ? <EmptyState title="Select a farm and report type" /> : loading ? <Spinner /> : reportType !== 'general' && (!data.items || data.items.length === 0) ? <EmptyState title="No data found" description="Try changing the filters." /> : (
                <>
                    <div className="border-b-2 border-primary-500 pb-4 mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{reportTypes.find((r) => r.key === reportType)?.label}</h2>
                        <p className="font-medium text-gray-700 dark:text-gray-300">{farmName}{farmLocation ? ` — ${farmLocation}` : ''}</p>
                        <p className="text-sm text-gray-500">{isCustom ? `${startDate} — ${endDate}` : periodOptions.find((p) => p.value === period)?.label} • {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    {Object.keys(s).filter((k) => k !== 'byType').length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {Object.entries(s).filter(([k]) => k !== 'byType').map(([k, v]) => (
                                <Card key={k}><p className="text-2xl font-bold text-primary-600">{typeof v === 'number' ? v.toLocaleString() : (v || 0)}</p><p className="text-xs text-gray-500 uppercase">{k.replace(/([A-Z])/g, ' $1').trim()}</p></Card>
                            ))}
                        </div>
                    )}

                    {reportType !== 'general' && data.items && data.items.length > 0 && (
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b">
                                        {reportType === 'stock' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Product</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Unit</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Qty</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Price/Unit</th><th className="px-3 py-2 text-right text-xs uppercase text-gray-500">Value</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Min Stock</th></>}
                                        {reportType === 'livestock' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Tag</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Type</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Breed</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Details</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Gender</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Weight</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Status</th></>}
                                        {reportType === 'production' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Date</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Type</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Animal</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Qty</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Unit</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Quality</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Value</th></>}
                                        {reportType === 'crops' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Field</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Crop</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Size</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Soil</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Status</th></>}
                                        {reportType === 'financial' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Date</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Type</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Category</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Description</th><th className="px-3 py-2 text-right text-xs uppercase text-gray-500">Amount</th></>}
                                        {reportType === 'vaccination' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Date</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Animal</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Vaccine</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Dosage</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Vet</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Next</th></>}
                                        {reportType === 'inventory' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Item</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Category</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Qty</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Unit</th><th className="px-3 py-2 text-right text-xs uppercase text-gray-500">Cost</th><th className="px-3 py-2 text-right text-xs uppercase text-gray-500">Value</th></>}
                                        {reportType === 'tasks' && <><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Task</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Assigned</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Priority</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Due</th><th className="px-3 py-2 text-left text-xs uppercase text-gray-500">Status</th></>}
                                    </tr></thead>
                                    <tbody>
                                        {(data.items || []).map((item) => (
                                            <tr key={item._id} className="border-b">
                                                {reportType === 'stock' && <><td className="px-3 py-2 font-medium">{item.product}</td><td className="px-3 py-2">{item.unit}</td><td className="px-3 py-2">{item.quantity}</td><td className="px-3 py-2">{item.pricePerUnit ? `KES ${(item.pricePerUnit || 0).toLocaleString()}` : '—'}</td><td className="px-3 py-2 text-right">KES {((item.quantity || 0) * (item.pricePerUnit || 0)).toLocaleString()}</td><td className="px-3 py-2">{item.minimumStock || '—'}</td></>}
                                                {reportType === 'livestock' && <><td className="px-3 py-2 font-medium">{item.isBatch ? (item.batchName || item.tagId) : item.tagId}</td><td className="px-3 py-2 capitalize">{item.type}{item.isBatch ? ' (Batch)' : ''}</td><td className="px-3 py-2">{item.breed || '—'}</td><td className="px-3 py-2">{item.isBatch ? `${item.batchCurrent || 0}/${item.batchQuantity || 0} birds` : (item.category || '—')}</td><td className="px-3 py-2">{item.isBatch ? '—' : (item.gender || '—')}</td><td className="px-3 py-2">{item.isBatch ? '—' : (item.weight ? `${item.weight}kg` : '—')}</td><td className="px-3 py-2 capitalize">{item.status}</td></>}
                                                {reportType === 'production' && <><td className="px-3 py-2">{new Date(item.date).toLocaleDateString('en-KE')}</td><td className="px-3 py-2 capitalize">{item.type}</td><td className="px-3 py-2">{item.animal?.tagId || '—'}</td><td className="px-3 py-2">{item.quantity}</td><td className="px-3 py-2">{item.unit}</td><td className="px-3 py-2">{item.quality || '—'}</td><td className="px-3 py-2">{item.totalValue ? `KES ${(item.totalValue || 0).toLocaleString()}` : '—'}</td></>}
                                                {reportType === 'crops' && <><td className="px-3 py-2 font-medium">{item.name}</td><td className="px-3 py-2">{item.crop || '—'}</td><td className="px-3 py-2">{item.size?.value ? `${item.size.value} ${item.size.unit}` : '—'}</td><td className="px-3 py-2">{item.soilType || '—'}</td><td className="px-3 py-2 capitalize">{item.status}</td></>}
                                                {reportType === 'financial' && <><td className="px-3 py-2">{new Date(item.date).toLocaleDateString('en-KE')}</td><td className="px-3 py-2 capitalize">{item.type}</td><td className="px-3 py-2 capitalize">{item.category}</td><td className="px-3 py-2">{item.description || '—'}</td><td className={`px-3 py-2 text-right font-medium ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{item.type === 'income' ? '+' : '-'} KES {(item.amount || 0).toLocaleString()}</td></>}
                                                {reportType === 'vaccination' && <><td className="px-3 py-2">{new Date(item.date).toLocaleDateString('en-KE')}</td><td className="px-3 py-2">{item.animal?.tagId || '—'}</td><td className="px-3 py-2">{item.medication || '—'}</td><td className="px-3 py-2">{item.dosage || '—'}</td><td className="px-3 py-2">{item.vetName || '—'}</td><td className="px-3 py-2">{item.nextCheckup ? new Date(item.nextCheckup).toLocaleDateString('en-KE') : '—'}</td></>}
                                                {reportType === 'inventory' && <><td className="px-3 py-2 font-medium">{item.name}</td><td className="px-3 py-2 capitalize">{item.category}</td><td className="px-3 py-2">{item.quantity}</td><td className="px-3 py-2">{item.unit}</td><td className="px-3 py-2 text-right">{item.cost ? `KES ${(item.cost || 0).toLocaleString()}` : '—'}</td><td className="px-3 py-2 text-right">{item.cost ? `KES ${((item.quantity || 0) * (item.cost || 0)).toLocaleString()}` : '—'}</td></>}
                                                {reportType === 'tasks' && <><td className="px-3 py-2 font-medium">{item.title}</td><td className="px-3 py-2">{item.assignedTo?.name || '—'}</td><td className="px-3 py-2 capitalize">{item.priority}</td><td className="px-3 py-2">{item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-KE') : '—'}</td><td className="px-3 py-2 capitalize">{(item.status || '').replace('_', ' ')}</td></>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}