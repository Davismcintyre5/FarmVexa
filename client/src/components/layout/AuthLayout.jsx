import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function AuthLayout() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6">
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="w-full max-w-md">
                {/* Brand header above the card */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-primary-500">🌾 FarmVexa</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        See. Sense. Predict. Grow.
                    </p>
                </div>

                {/* Rectangular card frame */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
                    <Outlet />
                </div>

                <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
                    © {new Date().getFullYear()} FarmVexa. All rights reserved.
                </p>
            </div>
        </div>
    );
}