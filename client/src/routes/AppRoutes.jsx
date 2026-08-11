import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import DashboardLayout from '../components/layout/DashboardLayout';
import MobileLayout from '../components/layout/MobileLayout';
import AuthLayout from '../components/layout/AuthLayout';

import { Login, Register, ForgotPassword, ResetPassword, PendingApproval } from '../pages/auth/auth';
import { FarmerDashboard } from '../pages/dashboard/dashboard';
import { FarmList, FarmDetail, FarmCreate, FarmEdit } from '../pages/farms/farms';
import { FieldList, FieldDetail, FieldCreate, FieldEdit } from '../pages/fields/fields';
import { CropScan, ScanResult, ScanHistory } from '../pages/scan/scan';
import { DeviceList, DeviceDetail, DeviceRegister } from '../pages/devices/devices';
import { AlertList } from '../pages/alerts/alerts';
import { SensorReadings } from '../pages/sensors/sensors';
import { FarmerProfile, ChangePassword } from '../pages/profile/profile';
import AIAssistant from '../pages/ai/AIAssistant';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            <Route path="/pending" element={
                isAuthenticated && user?.approvalStatus === 'pending'
                    ? <PendingApproval />
                    : <Navigate to="/dashboard" />
            } />

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
                <Route path="/ai-chat" element={<AIAssistant />} />
                <Route path="/sensors" element={<SensorReadings />} />
                <Route path="/devices" element={<DeviceList />} />
                <Route path="/devices/register" element={<DeviceRegister />} />
                <Route path="/devices/:deviceId" element={<DeviceDetail />} />
                <Route path="/alerts" element={<AlertList />} />
                <Route path="/profile" element={<FarmerProfile />} />
                <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            <Route element={isAuthenticated ? <MobileLayout /> : <Navigate to="/login" />}>
                <Route path="/m/" element={<FarmerDashboard />} />
                <Route path="/m/farms" element={<FarmList />} />
                <Route path="/m/scan" element={<CropScan />} />
                <Route path="/m/ai-chat" element={<AIAssistant />} />
                <Route path="/m/sensors" element={<SensorReadings />} />
                <Route path="/m/alerts" element={<AlertList />} />
                <Route path="/m/profile" element={<FarmerProfile />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;