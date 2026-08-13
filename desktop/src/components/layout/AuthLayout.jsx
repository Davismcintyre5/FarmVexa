import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function AuthLayout() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
            <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-primary-500">🌾 FarmVexa</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">See. Sense. Predict. Grow.</p>
            </div>
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
}