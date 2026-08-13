import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, Mail, MessageCircle, HelpCircle, BookOpen, Shield, Moon, Sun, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const [settings, setSettings] = useState({});
    const [marketEnabled, setMarketEnabled] = useState(false);
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/settings`)
            .then((res) => setSettings(res.data.data || {}))
            .catch(() => {});
        
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/public/market/status`)
            .then((res) => setMarketEnabled(res.data.data?.enabled || false))
            .catch(() => {});
    }, []);

    const allowRegister = settings.allowSelfRegistration !== false;

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-500">
                        🌾 FarmVexa
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">Home</Link>
                        <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">Features</a>
                        {marketEnabled && (
                            <Link to="/market" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">
                                <ShoppingBag className="w-4 h-4" /> Market
                            </Link>
                        )}
                        <a href="#downloads" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">Downloads</a>

                        <div className="relative">
                            <button onClick={() => setSupportOpen(!supportOpen)}
                                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">
                                Support <ChevronDown className="w-3 h-3" />
                            </button>
                            {supportOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-2"
                                    onMouseLeave={() => setSupportOpen(false)}>
                                    <a href="#contact" onClick={() => setSupportOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Phone className="w-4 h-4" /> Contact
                                    </a>
                                    <a href="#help" onClick={() => setSupportOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <HelpCircle className="w-4 h-4" /> Help Center
                                    </a>
                                    <a href="#faq" onClick={() => setSupportOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <BookOpen className="w-4 h-4" /> FAQs
                                    </a>
                                    <a href="#terms" onClick={() => setSupportOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Shield className="w-4 h-4" /> Terms
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">
                                    🚀 Launch App
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">Login</Link>
                                    {allowRegister ? (
                                        <Link to="/register" className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">Register</Link>
                                    ) : (
                                        <Link to="/get-access" className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">Get Access</Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600">
                        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {open && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link to="/" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Home</Link>
                        <a href="#features" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Features</a>
                        {marketEnabled && (
                            <Link to="/market" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <ShoppingBag className="w-4 h-4" /> Market
                            </Link>
                        )}
                        <a href="#downloads" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Downloads</a>
                        <a href="#contact" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Contact</a>
                        <a href="#faq" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">FAQs</a>
                        <div className="flex gap-2 pt-2">
                            <button onClick={toggleTheme} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500">
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="flex-1 text-center px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">🚀 Launch App</Link>
                            ) : (
                                <>
                                    <Link to="/login" className="flex-1 text-center px-4 py-2 border border-primary-500 text-primary-500 text-sm rounded-lg">Login</Link>
                                    {allowRegister ? (
                                        <Link to="/register" className="flex-1 text-center px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">Register</Link>
                                    ) : (
                                        <Link to="/get-access" className="flex-1 text-center px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">Get Access</Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}