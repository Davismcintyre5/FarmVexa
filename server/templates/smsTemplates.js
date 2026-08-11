const getAdminSettings = async () => {
    const Settings = require('../models/admin/Settings');
    let settings = await Settings.findOne();
    if (!settings) {
        settings = { system: { supportPhone: '+254700000000', appName: 'FarmVexa' } };
    }
    return settings;
};

const farmerApproved = async (user, settings) =>
    `FarmVexa: Welcome ${user.name}! Your account is approved. Login at ${process.env.CLIENT_URL}/login to start smart farming. Help: ${settings?.system?.supportPhone || '+254700000000'}`;

const farmerWelcome = async (user, settings) =>
    `Welcome to FarmVexa ${user.name}! Start monitoring: ${process.env.CLIENT_URL}/login. Help: ${settings.system?.supportPhone}`;

const farmerAlertHigh = async (user, alert, settings) =>
    `FARMVEXA HIGH ALERT: ${alert.message} (${alert.farmName}). Action needed! ${process.env.CLIENT_URL}/alerts. Help: ${settings.system?.supportPhone}`;

const farmerDiseaseDetected = async (user, data, settings) =>
    `FARMVEXA: ${data.disease} on ${data.cropType} (${data.confidence}%). ${data.recommendation?.substring(0, 80)}. Help: ${settings.system?.supportPhone}`;

const farmerDeviceOffline = async (user, device, settings) =>
    `FARMVEXA: Device ${device.deviceId} offline at ${device.farmName}. Check power/Wi-Fi. Support: ${settings.system?.supportPhone}`;

const adminSystemCritical = async (admin, error, settings) =>
    `FARMVEXA CRITICAL: ${error.message?.substring(0, 100)}. Check server immediately. ${settings.system?.supportPhone}`;

const adminGeminiExceeded = async (admin, usage, settings) =>
    `FARMVEXA: Gemini limit exceeded (${usage.dailyLimit}). Users blocked. Update: ${process.env.ADMIN_URL}/settings`;

const adminPythonOffline = async (admin, settings) =>
    `FARMVEXA CRITICAL: Python AI Engine offline. AI features down. Check: ${process.env.PYTHON_AI_URL}`;

const adminNewFarmer = async (admin, farmer, settings) =>
    `FARMVEXA: New farmer ${farmer.name} (${farmer.email}) pending approval. Review: ${process.env.ADMIN_URL}/users`;

module.exports = {
    farmerApproved,
    farmerWelcome,
    farmerAlertHigh,
    farmerDiseaseDetected,
    farmerDeviceOffline,
    adminSystemCritical,
    adminGeminiExceeded,
    adminPythonOffline,
    adminNewFarmer,
};