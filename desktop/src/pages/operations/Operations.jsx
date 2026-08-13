import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LivestockTab from './LivestockTab';
import HealthTab from './HealthTab';
import ProductionTab from './ProductionTab';
import InventoryTab from './InventoryTab';
import EquipmentTab from './EquipmentTab';
import FinanceTab from './FinanceTab';
import TeamTasksTab from './TeamTasksTab';
import MarketTab from './MarketTab';
import ReportsTab from './ReportsTab';
import { GitBranch, Heart, Package, Boxes, Wrench, DollarSign, Users, ShoppingBag, FileText } from 'lucide-react';

export default function Operations() {
    const { user } = useAuth();
    const role = user?.role || 'farmer';

    const allTabs = [
        { key: 'livestock', icon: GitBranch, label: 'Livestock', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { key: 'health', icon: Heart, label: 'Health', roles: ['farmer', 'vet', 'manager'] },
        { key: 'production', icon: Package, label: 'Production', roles: ['farmer', 'worker', 'manager'] },
        { key: 'inventory', icon: Boxes, label: 'Inventory', roles: ['farmer', 'manager'] },
        { key: 'equipment', icon: Wrench, label: 'Equipment', roles: ['farmer', 'manager'] },
        { key: 'finance', icon: DollarSign, label: 'Finance', roles: ['farmer', 'manager'] },
        { key: 'team', icon: Users, label: 'Team & Tasks', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { key: 'market', icon: ShoppingBag, label: 'Market', roles: ['farmer'] },
        { key: 'reports', icon: FileText, label: 'Reports', roles: ['farmer', 'manager'] },
    ];

    const tabs = allTabs.filter((t) => t.roles.includes(role));
    const [tab, setTab] = useState(tabs[0]?.key || 'livestock');

    return (
        <div className="page-container space-y-6">
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map(({ key, icon: Icon, label }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>
            {tab === 'livestock' && <LivestockTab readOnly={role === 'vet' || role === 'worker'} />}
            {tab === 'health' && <HealthTab readOnly={!['farmer', 'vet', 'manager'].includes(role)} />}
            {tab === 'production' && <ProductionTab readOnly={!['farmer', 'worker', 'manager'].includes(role)} />}
            {tab === 'inventory' && <InventoryTab readOnly={!['farmer', 'manager'].includes(role)} />}
            {tab === 'equipment' && <EquipmentTab readOnly={!['farmer', 'manager'].includes(role)} />}
            {tab === 'finance' && <FinanceTab />}
            {tab === 'team' && <TeamTasksTab readOnly={role === 'worker' || role === 'vet'} />}
            {tab === 'market' && <MarketTab />}
            {tab === 'reports' && <ReportsTab />}
        </div>
    );
}