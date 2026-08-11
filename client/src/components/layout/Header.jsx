import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Moon, Sun, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
import { getFarms } from '../../api/farms';
import { getFarmAlerts } from '../../api/alerts';

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { newAlert, setNewAlert } = useSocket();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [alertCount, setAlertCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchAlertCount = useCallback(async () => {
        try {
            const res = await getFarms();
            let total = 0;
            for (const f of res.data.data.farms || []) {
                try {
                    const a = await getFarmAlerts(f._id);
                    total += (a.data.data.alerts || []).filter((x) => !x.isRead).length;
                } catch {}
            }
            setAlertCount(total);
        } catch {}
    }, []);

    useEffect(() => { fetchAlertCount(); }, [fetchAlertCount]);

    useEffect(() => {
        if (newAlert) {
            setAlertCount((prev) => prev + 1);
            setNewAlert(null);
        }
    }, [newAlert, setNewAlert]);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6">
            <div className="md:hidden w-10" />
            <h1 className="text-xl font-bold text-primary-500 md:hidden">🌾 FarmVexa</h1>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={() => { navigate('/alerts'); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 relative">
                    <Bell className="w-5 h-5" />
                    {alertCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
                            {alertCount > 9 ? '9+' : alertCount}
                        </span>
                    )}
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg py-1.5 px-2 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.county || 'Farmer'}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <Link to="/settings" onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Settings className="w-4 h-4" /> Settings
                                </Link>
                            </div>
                            <div className="p-1 border-t border-gray-200 dark:border-gray-700">
                                <button onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}