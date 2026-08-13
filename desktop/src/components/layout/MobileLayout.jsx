import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function MobileLayout() {
    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 md:hidden">
            <Header />
            <main className="flex-1 overflow-auto p-4 pb-20">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}