import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, MessageCircle, Bell, Wheat } from 'lucide-react';

const links = [
    { to: '/m/', icon: LayoutDashboard, label: 'Home' },
    { to: '/m/farms', icon: Wheat, label: 'Farms' },
    { to: '/m/scan', icon: Camera, label: 'Scan' },
    { to: '/m/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/m/alerts', icon: Bell, label: 'Alerts' },
];

export default function BottomNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40">
            <div className="flex justify-around py-2">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium ${
                                isActive ? 'text-primary-500' : 'text-gray-400'
                            }`
                        }
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}