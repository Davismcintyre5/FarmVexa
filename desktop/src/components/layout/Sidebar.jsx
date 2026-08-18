import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wheat, Camera, Activity, Cpu, CloudSun, CreditCard, FolderOpen, MessageCircle, Settings, Menu, X, ScanLine } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const [showAI, setShowAI] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setShowAI(res.data.data?.showAI ?? true))
            .catch(() => {});
    }, []);

    const role = user?.role || 'farmer';

    const mainLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/farms', icon: Wheat, label: 'Farms', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/scan', icon: Camera, label: 'Scan Crop', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/field-scan', icon: ScanLine, label: 'Field Scan', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/sensors', icon: Activity, label: 'Sensors', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/devices', icon: Cpu, label: 'Devices', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/weather', icon: CloudSun, label: 'Weather', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/operations', icon: FolderOpen, label: 'Operations', roles: ['farmer', 'worker', 'vet', 'manager'] },
        { to: '/plans', icon: CreditCard, label: 'Plans', roles: ['farmer'] },
    ];

    const filteredLinks = mainLinks.filter((l) => l.roles.includes(role));

    return (
        <>
            <button onClick={() => setOpen(!open)} className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-600 dark:text-gray-300">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {open && <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}

            <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                    <h1 className="text-xl font-bold text-primary-500">🌾 FarmVexa</h1>
                    <button onClick={() => setOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                {/* Scrollable nav area */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {filteredLinks.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} onClick={() => setOpen(false)}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                            <Icon className="w-5 h-5" />{label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer — fixed at bottom */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1 flex-shrink-0">
                    {showAI && (
                        <NavLink to="/ai-chat" onClick={() => setOpen(false)}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                            <MessageCircle className="w-5 h-5" />AI Chat
                        </NavLink>
                    )}
                    <NavLink to="/settings" onClick={() => setOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <Settings className="w-5 h-5" />Settings
                    </NavLink>
                </div>
            </aside>
        </>
    );
}