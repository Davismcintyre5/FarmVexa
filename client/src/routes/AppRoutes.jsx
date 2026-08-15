import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import DashboardLayout from '../components/layout/DashboardLayout';
import MobileLayout from '../components/layout/MobileLayout';
import AuthLayout from '../components/layout/AuthLayout';
import PublicLayout from '../components/public/PublicLayout';

import { Login, Register, ForgotPassword, ResetPassword, PendingApproval } from '../pages/auth/auth';
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
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/get-access" element={<GetAccess />} />
                <Route path="/market" element={<Market />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Pending Approval */}
            <Route path="/pending" element={isAuthenticated && user?.approvalStatus === 'pending' ? <PendingApproval /> : <Navigate to="/dashboard" />} />

            {/* Protected Dashboard Routes */}
            <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
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
                <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Mobile Routes */}
            <Route element={isAuthenticated ? <MobileLayout /> : <Navigate to="/login" />}>
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

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;