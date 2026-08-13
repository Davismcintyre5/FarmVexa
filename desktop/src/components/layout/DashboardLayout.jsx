import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function DashboardLayout() {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}