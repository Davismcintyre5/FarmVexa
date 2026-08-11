import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wheat, Camera, MessageCircle, Bell, Cpu, User, Menu, X, Activity } from 'lucide-react';

const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/farms', icon: Wheat, label: 'Farms' },
    { to: '/scan', icon: Camera, label: 'Scan Crop' },
    { to: '/ai-chat', icon: MessageCircle, label: 'AI Chat' },
    { to: '/sensors', icon: Activity, label: 'Sensors' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/devices', icon: Cpu, label: 'Devices' },
    { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-600 dark:text-gray-300"
            >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {open && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
            )}

            <aside className={`
                fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300
                ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary-500">🌾 FarmVexa</h1>
                    <button onClick={() => setOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {links.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}