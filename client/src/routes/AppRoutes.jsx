import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import DashboardLayout from '../components/layout/DashboardLayout';
import MobileLayout from '../components/layout/MobileLayout';
import AuthLayout from '../components/layout/AuthLayout';
import PublicLayout from '../components/public/PublicLayout';

import { Login, Register, ForgotPassword, ResetPassword } from '../pages/auth/auth';
import Invoice from '../pages/auth/Invoice';
import Pending from '../pages/pending/Pending';
import { FarmerDashboard } from '../pages/dashboard/dashboard';
import { FarmList, FarmDetail, FarmCreate, FarmEdit } from '../pages/farms/farms';
import { FieldList, FieldDetail, FieldCreate, FieldEdit } from '../pages/fields/fields';
import { CropScan, ScanResult, ScanHistory } from '../pages/scan/scan';
import FieldScan from '../pages/scan/FieldScan';
import FieldScanHistory from '../pages/scan/FieldScanHistory';
import FieldScanResult from '../pages/scan/FieldScanResult';
import { DeviceList, DeviceDetail, DeviceRegister } from '../pages/devices/devices';
import { AlertList } from '../pages/alerts/alerts';
import { SensorReadings } from '../pages/sensors/sensors';
import AIAssistant from '../pages/ai/AIAssistant';
import Operations from '../pages/operations/Operations';
import Weather from '../pages/weather/Weather';
import Settings from '../pages/settings/Settings';
import Landing from '../pages/public/Landing';
import GetAccess from '../pages/public/GetAccess';
import Market from '../pages/public/Market';
import Documents from '../pages/public/Documents';
import Pricing from '../pages/public/Pricing';
import Renewal from '../pages/auth/Renewal';
import Plans from '../pages/plan/Plans';
import UpgradeCheckout from '../pages/plan/UpgradeCheckout';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
    const { user, isAuthenticated, isLoading, scope } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isApprovedActive = isAuthenticated && scope === 'active';

    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/get-access" element={<GetAccess />} />
                <Route path="/market" element={<Market />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/pricing" element={<Pricing />} />
            </Route>

            {/* Public invoice (no layout — email link target) */}
            <Route path="/invoice/:invoiceNumber" element={<Invoice />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={scope === 'pending' ? '/pending' : scope === 'expired' ? '/renewal' : '/dashboard'} />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={scope === 'pending' ? '/pending' : '/dashboard'} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/renewal" element={<Renewal />} />
            </Route>

            {/* Pending hub */}
            <Route
                path="/pending"
                element={
                    !isAuthenticated
                        ? <Navigate to="/login" replace />
                        : scope === 'active'
                        ? <Navigate to="/dashboard" replace />
                        : <Pending />
                }
            />

            {/* Protected Dashboard Routes */}
            <Route element={isApprovedActive ? <DashboardLayout /> : <Navigate to={isAuthenticated ? '/pending' : '/login'} />}>
                <Route path="/dashboard" element={<FarmerDashboard />} />
                <Route path="/farms" element={<FarmList />} />
                <Route path="/farms/new" element={<FarmCreate />} />
                <Route path="/farms/:farmId" element={<FarmDetail />} />
                <Route path="/farms/:farmId/edit" element={<FarmEdit />} />
                <Route path="/farms/:farmId/fields" element={<FieldList />} />
                <Route path="/farms/:farmId/fields/new" element={<FieldCreate />} />
                <Route path="/fields/:fieldId" element={<FieldDetail />} />
                <Route path="/fields/:fieldId/edit" element={<FieldEdit />} />
                <Route path="/fields/:fieldId/sensors" element={<SensorReadings />} />
                <Route path="/fields/:fieldId/scans" element={<ScanHistory />} />
                <Route path="/scan" element={<CropScan />} />
                <Route path="/scan/result/:imageId" element={<ScanResult />} />
                <Route path="/field-scan" element={<FieldScan />} />
                <Route path="/field-scan/history" element={<FieldScanHistory />} />
                <Route path="/field-scan/:scanId" element={<FieldScanResult />} />
                <Route path="/sensors" element={<SensorReadings />} />
                <Route path="/devices" element={<DeviceList />} />
                <Route path="/devices/register" element={<DeviceRegister />} />
                <Route path="/devices/:deviceId" element={<DeviceDetail />} />
                <Route path="/ai-chat" element={<AIAssistant />} />
                <Route path="/alerts" element={<AlertList />} />
                <Route path="/operations" element={<Operations />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans/upgrade/:planName" element={<UpgradeCheckout />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Mobile Routes */}
            <Route element={isApprovedActive ? <MobileLayout /> : <Navigate to={isAuthenticated ? '/pending' : '/login'} />}>
                <Route path="/m/" element={<FarmerDashboard />} />
                <Route path="/m/farms" element={<FarmList />} />
                <Route path="/m/scan" element={<CropScan />} />
                <Route path="/m/field-scan" element={<FieldScan />} />
                <Route path="/m/field-scan/history" element={<FieldScanHistory />} />
                <Route path="/m/field-scan/:scanId" element={<FieldScanResult />} />
                <Route path="/m/sensors" element={<SensorReadings />} />
                <Route path="/m/devices" element={<DeviceList />} />
                <Route path="/m/ai-chat" element={<AIAssistant />} />
                <Route path="/m/alerts" element={<AlertList />} />
                <Route path="/m/operations" element={<Operations />} />
                <Route path="/m/weather" element={<Weather />} />
                <Route path="/m/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;