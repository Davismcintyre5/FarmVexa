const getAdminSettings = async () => {
    const Settings = require('../models/admin/Settings');
    let settings = await Settings.findOne();
    if (!settings) {
        settings = {
            system: { supportPhone: '+254700000000', supportEmail: 'support@farmvexa.com', appName: 'FarmVexa' }
        };
    }
    return settings;
};

const baseTemplate = (content, settings) => {
    const phone = settings?.system?.supportPhone || '+254700000000';
    const email = settings?.system?.supportEmail || 'support@farmvexa.com';
    const appName = settings?.system?.appName || 'FarmVexa';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #2d6a4f; color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
        .body { padding: 30px; color: #333; line-height: 1.6; }
        .alert-high { border-left: 4px solid #e74c3c; background: #fdf0ef; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .alert-medium { border-left: 4px solid #f39c12; background: #fef9e7; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .alert-info { border-left: 4px solid #3498db; background: #ebf5fb; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .alert-success { border-left: 4px solid #27ae60; background: #eafaf1; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .button { display: inline-block; background: #2d6a4f; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; }
        .footer p { margin: 3px 0; }
        .data-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .data-label { font-weight: bold; color: #555; }
        .data-value { color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌾 ${appName}</h1>
            <p>AI-Powered Farm Intelligence</p>
        </div>
        <div class="body">
            ${content}
        </div>
        <div class="footer">
            <p><strong>${appName}</strong> - See. Sense. Predict. Grow.</p>
            <p>📞 ${phone} | 📧 ${email}</p>
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

const farmerRegistrationPending = async (user, data, settings) => {
    const phone = settings?.system?.supportPhone || '+254700000000';
    const email = settings?.system?.supportEmail || 'support@farmvexa.com';
    return {
        subject: '⏳ Your FarmVexa account is under review',
        html: baseTemplate(`
            <h2>Account Pending Approval</h2>
            <div class="alert-info">
                <strong>Thank you for registering, ${user.name}!</strong><br>
                Your account is being reviewed by our team.
            </div>
            <p>Here's what happens next:</p>
            <ol>
                <li>An administrator reviews your registration</li>
                <li>You'll receive an email when approved (usually within 24 hours)</li>
                <li>Once approved, you can log in and start farming smart</li>
            </ol>
            <p style="margin-top: 15px; font-size: 13px; color: #777;">
                Questions? Contact us:<br>
                📞 ${phone}<br>
                📧 ${email}
            </p>
        `, settings),
    };
};

const farmerApproved = async (user, data, settings) => {
    const phone = settings?.system?.supportPhone || '+254700000000';
    return {
        subject: '✅ Welcome to FarmVexa! Your account is approved',
        html: baseTemplate(`
            <h2>🎉 You're Approved, ${user.name}!</h2>
            <div class="alert-success">
                <strong>Your FarmVexa account is now active.</strong><br>
                Start your smart farming journey today.
            </div>
            <p>With FarmVexa you can:</p>
            <ul>
                <li>📡 Connect IoT sensors to monitor soil and weather</li>
                <li>📸 Scan crops for diseases using your phone camera</li>
                <li>🤖 Chat with AI for instant farming advice</li>
                <li>📊 View real-time dashboards and reports</li>
                <li>🔔 Receive instant alerts for crop risks</li>
            </ul>
            <a href="${process.env.CLIENT_URL}/login" class="button">Login to Your Dashboard</a>
            <p style="margin-top: 20px; font-size: 14px;">
                <strong>Getting Started:</strong><br>
                1. Log in with your email and password<br>
                2. Create your first farm<br>
                3. Add fields and connect devices<br>
                4. Start monitoring your crops
            </p>
            <p style="margin-top: 15px; font-size: 13px; color: #777;">
                Need help? 📞 ${phone}
            </p>
        `, settings),
    };
};

const farmerRejected = async (user, data, settings) => {
    const phone = settings?.system?.supportPhone || '+254700000000';
    const email = settings?.system?.supportEmail || 'support@farmvexa.com';
    return {
        subject: 'Update regarding your FarmVexa registration',
        html: baseTemplate(`
            <h2>Registration Update</h2>
            <div class="alert-high">
                <strong>Hello ${user.name},</strong><br>
                Unfortunately, your registration was not approved at this time.
            </div>
            <div class="data-row">
                <span class="data-label">Reason:</span>
                <span class="data-value">${data.reason || user.rejectionReason || 'No reason provided'}</span>
            </div>
            <p><strong>What you can do:</strong></p>
            <ul>
                <li>Contact our support team to discuss the decision</li>
                <li>Re-register with updated or complete information</li>
                <li>Appeal the decision by providing additional details</li>
            </ul>
            <p>
                📞 ${phone}<br>
                📧 ${email}
            </p>
            <p style="margin-top: 15px; font-size: 13px; color: #777;">
                Re-register at: <a href="${process.env.CLIENT_URL}/register">${process.env.CLIENT_URL}/register</a>
            </p>
        `, settings),
    };
};

const farmerWelcome = async (user, data, settings) => ({
    subject: `Welcome to FarmVexa, ${user.name}! 🌾`,
    html: baseTemplate(`
        <h2>Welcome, ${user.name}! 👋</h2>
        <div class="alert-success">
            <strong>Your FarmVexa account is ready!</strong>
        </div>
        <p>You can now:</p>
        <ul>
            <li>📡 Connect IoT sensors to your fields</li>
            <li>📸 Scan crops for diseases</li>
            <li>📊 View real-time dashboards</li>
            <li>🔔 Receive instant alerts</li>
        </ul>
        <a href="${process.env.CLIENT_URL}/login" class="button">Go to Dashboard</a>
    `, settings),
});

const farmerPasswordReset = async (user, data, settings) => ({
    subject: 'FarmVexa - Password Reset',
    html: baseTemplate(`
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your FarmVexa account.</p>
        <a href="${data.resetUrl || ''}" class="button">Reset Password</a>
        <p style="font-size: 13px; color: #777;">Link expires in 30 minutes.</p>
    `, settings),
});

const farmerAlertHigh = async (user, data, settings) => ({
    subject: `🔴 HIGH RISK ALERT - ${data.farmName || 'Your Farm'}`,
    html: baseTemplate(`
        <h2>🔴 High Risk Alert</h2>
        <div class="alert-high"><strong>${data.message}</strong></div>
        <div class="data-row"><span class="data-label">Farm:</span><span class="data-value">${data.farmName || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Severity:</span><span class="data-value">HIGH</span></div>
        ${data.recommendation ? `<div class="data-row"><span class="data-label">Action:</span><span class="data-value">${data.recommendation}</span></div>` : ''}
        <a href="${process.env.CLIENT_URL}/alerts" class="button">View Alert</a>
    `, settings),
});

const farmerAlertMedium = async (user, data, settings) => ({
    subject: `🟡 MEDIUM ALERT - ${data.farmName || 'Your Farm'}`,
    html: baseTemplate(`
        <h2>🟡 Medium Risk Alert</h2>
        <div class="alert-medium"><strong>${data.message}</strong></div>
        <div class="data-row"><span class="data-label">Farm:</span><span class="data-value">${data.farmName || 'N/A'}</span></div>
        ${data.recommendation ? `<div class="data-row"><span class="data-label">Action:</span><span class="data-value">${data.recommendation}</span></div>` : ''}
        <a href="${process.env.CLIENT_URL}/alerts" class="button">View Details</a>
    `, settings),
});

const farmerDiseaseDetected = async (user, data, settings) => ({
    subject: `🦠 Disease Detected: ${data.disease} - ${data.farmName || 'Your Farm'}`,
    html: baseTemplate(`
        <h2>🦠 Crop Disease Detected</h2>
        <div class="alert-high"><strong>${data.disease}</strong> detected with ${data.confidence}% confidence.</div>
        <div class="data-row"><span class="data-label">Farm:</span><span class="data-value">${data.farmName || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Crop:</span><span class="data-value">${data.cropType || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Severity:</span><span class="data-value">${data.severity || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Recommendation:</span><span class="data-value">${data.recommendation || 'Inspect immediately'}</span></div>
        <a href="${process.env.CLIENT_URL}/crops" class="button">View Crop Analysis</a>
    `, settings),
});

const farmerDeviceOffline = async (user, data, settings) => ({
    subject: `📡 Device Offline - ${data.deviceId || 'Unknown'}`,
    html: baseTemplate(`
        <h2>📡 Sensor Device Offline</h2>
        <div class="alert-medium"><strong>Device ${data.deviceId || 'Unknown'}</strong> has gone offline.</div>
        <div class="data-row"><span class="data-label">Farm:</span><span class="data-value">${data.farmName || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Last Seen:</span><span class="data-value">${data.lastSeen || 'Unknown'}</span></div>
        <a href="${process.env.CLIENT_URL}/devices" class="button">Check Device</a>
    `, settings),
});

const farmerDailyReport = async (user, data, settings) => ({
    subject: `📊 Daily Farm Report - ${data.farmName || 'Your Farm'}`,
    html: baseTemplate(`
        <h2>📊 Daily Farm Report</h2>
        <p>Your farm summary for ${new Date().toLocaleDateString('en-KE')}:</p>
        <div class="data-row"><span class="data-label">🌡️ Temperature:</span><span class="data-value">${data.avgTemp || 'N/A'}°C</span></div>
        <div class="data-row"><span class="data-label">💧 Humidity:</span><span class="data-value">${data.avgHumidity || 'N/A'}%</span></div>
        <div class="data-row"><span class="data-label">🌱 Soil Moisture:</span><span class="data-value">${data.avgSoilMoisture || 'N/A'}%</span></div>
        <div class="data-row"><span class="data-label">⚠️ Alerts:</span><span class="data-value">${data.alertsCount || 0}</span></div>
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Dashboard</a>
    `, settings),
});

const farmerWeeklyReport = async (user, data, settings) => ({
    subject: `📈 Weekly Farm Report - ${data.farmName || 'Your Farm'}`,
    html: baseTemplate(`
        <h2>📈 Weekly Farm Report</h2>
        <div class="data-row"><span class="data-label">🟢 Avg Health:</span><span class="data-value">${data.avgHealthScore || 'N/A'}%</span></div>
        <div class="data-row"><span class="data-label">⚠️ Alerts:</span><span class="data-value">${data.totalAlerts || 0}</span></div>
        <div class="data-row"><span class="data-label">🦠 Diseases:</span><span class="data-value">${data.diseasesDetected || 0}</span></div>
        <div class="data-row"><span class="data-label">📸 Scans:</span><span class="data-value">${data.cropScans || 0}</span></div>
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Report</a>
    `, settings),
});

const farmerNewDeviceLogin = async (user, data, settings) => ({
    subject: '🔐 New Device Login - FarmVexa',
    html: baseTemplate(`
        <h2>🔐 New Device Login</h2>
        <p>Your account was accessed from a new device:</p>
        <div class="data-row"><span class="data-label">Browser:</span><span class="data-value">${data.browser || 'Unknown'}</span></div>
        <div class="data-row"><span class="data-label">OS:</span><span class="data-value">${data.os || 'Unknown'}</span></div>
        <div class="data-row"><span class="data-label">Time:</span><span class="data-value">${new Date().toLocaleString('en-KE')}</span></div>
        <div class="alert-info">If this wasn't you, contact support immediately.</div>
    `, settings),
});

const adminNewFarmer = async (user, data, settings) => ({
    subject: `👨‍🌾 New Farmer Registration: ${data.farmer?.name || 'Unknown'}`,
    html: baseTemplate(`
        <h2>👨‍🌾 New Farmer Pending Approval</h2>
        <div class="data-row"><span class="data-label">Name:</span><span class="data-value">${data.farmer?.name || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Email:</span><span class="data-value">${data.farmer?.email || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Phone:</span><span class="data-value">${data.farmer?.phone || 'N/A'}</span></div>
        <div class="data-row"><span class="data-label">Date:</span><span class="data-value">${new Date().toLocaleString('en-KE')}</span></div>
        <a href="${process.env.ADMIN_URL}/approvals" class="button">Review & Approve</a>
    `, settings),
});

const adminSystemCritical = async (user, data, settings) => ({
    subject: '🚨 CRITICAL SYSTEM ALERT - FarmVexa',
    html: baseTemplate(`
        <h2>🚨 Critical System Alert</h2>
        <div class="alert-high"><strong>${data.message || 'System error detected'}</strong></div>
        <div class="data-row"><span class="data-label">Time:</span><span class="data-value">${new Date().toLocaleString('en-KE')}</span></div>
        <div class="data-row"><span class="data-label">Component:</span><span class="data-value">${data.component || 'Unknown'}</span></div>
        <p>Immediate attention required.</p>
    `, settings),
});

const adminGeminiEightyPercent = async (user, data, settings) => ({
    subject: '⚠️ Gemini API at 80% - FarmVexa',
    html: baseTemplate(`
        <h2>⚠️ Gemini API Usage Warning</h2>
        <div class="alert-medium"><strong>Daily limit at 80%</strong></div>
        <div class="data-row"><span class="data-label">Requests Today:</span><span class="data-value">${data.requestsToday || 0}</span></div>
        <div class="data-row"><span class="data-label">Daily Limit:</span><span class="data-value">${data.dailyLimit || 0}</span></div>
        <a href="${process.env.ADMIN_URL}/settings" class="button">Manage Limits</a>
    `, settings),
});

const adminGeminiExceeded = async (user, data, settings) => ({
    subject: '🚫 Gemini API Limit Exceeded - FarmVexa',
    html: baseTemplate(`
        <h2>🚫 Gemini API Limit Exceeded</h2>
        <div class="alert-high"><strong>Daily limit of ${data.dailyLimit || 0} requests reached.</strong></div>
        <p>Users cannot use AI features until reset.</p>
        <a href="${process.env.ADMIN_URL}/settings" class="button">Increase Limit</a>
    `, settings),
});

const adminPythonOffline = async (user, data, settings) => ({
    subject: '🔴 Python AI Engine Offline - FarmVexa',
    html: baseTemplate(`
        <h2>🔴 Python AI Engine Offline</h2>
        <div class="alert-high"><strong>The Python AI Engine is not responding.</strong></div>
        <p>AI features are currently unavailable.</p>
        <div class="data-row"><span class="data-label">Server:</span><span class="data-value">${process.env.PYTHON_AI_URL || 'Unknown'}</span></div>
    `, settings),
});

const adminDeviceOffline24h = async (user, data, settings) => ({
    subject: `📡 Device Offline 24+ Hours - ${data.deviceId || 'Unknown'}`,
    html: baseTemplate(`
        <h2>📡 Device Offline 24+ Hours</h2>
        <div class="data-row"><span class="data-label">Device:</span><span class="data-value">${data.deviceId || 'Unknown'}</span></div>
        <div class="data-row"><span class="data-label">Farm:</span><span class="data-value">${data.farmName || 'N/A'}</span></div>
        <a href="${process.env.ADMIN_URL}/devices" class="button">Check Devices</a>
    `, settings),
});

const adminTrainingComplete = async (user, data, settings) => ({
    subject: `✅ Model Training Complete - ${data.name || 'Unknown'}`,
    html: baseTemplate(`
        <h2>✅ Model Training Complete</h2>
        <div class="alert-success"><strong>${data.name || 'Model'}</strong> v${data.version || '1.0'} is ready.</div>
        <div class="data-row"><span class="data-label">Accuracy:</span><span class="data-value">${data.accuracy || 'N/A'}%</span></div>
        <div class="data-row"><span class="data-label">Duration:</span><span class="data-value">${data.trainingTime || 'N/A'}</span></div>
        <a href="${process.env.ADMIN_URL}/models" class="button">Deploy Model</a>
    `, settings),
});

const adminNewAdmin = async (user, data, settings) => ({
    subject: '🛠️ New Admin Account Created - FarmVexa',
    html: baseTemplate(`
        <h2>🛠️ New Admin Account</h2>
        <div class="data-row"><span class="data-label">Name:</span><span class="data-value">${data.name}</span></div>
        <div class="data-row"><span class="data-label">Email:</span><span class="data-value">${data.email}</span></div>
        <div class="data-row"><span class="data-label">Role:</span><span class="data-value">${data.role || 'admin'}</span></div>
    `, settings),
});

const adminWeeklyReport = async (user, data, settings) => ({
    subject: '📊 Weekly System Report - FarmVexa',
    html: baseTemplate(`
        <h2>📊 Weekly System Report</h2>
        <div class="data-row"><span class="data-label">👨‍🌾 Farmers:</span><span class="data-value">${data.totalFarmers || 0}</span></div>
        <div class="data-row"><span class="data-label">🌾 Farms:</span><span class="data-value">${data.totalFarms || 0}</span></div>
        <div class="data-row"><span class="data-label">📸 Scans:</span><span class="data-value">${data.cropScans || 0}</span></div>
        <div class="data-row"><span class="data-label">🤖 AI Requests:</span><span class="data-value">${data.geminiRequests || 0}</span></div>
        <div class="data-row"><span class="data-label">⚠️ Alerts:</span><span class="data-value">${data.alertsSent || 0}</span></div>
        <a href="${process.env.ADMIN_URL}" class="button">View Dashboard</a>
    `, settings),
});

module.exports = {
    farmerRegistrationPending,
    farmerApproved,
    farmerRejected,
    farmerWelcome,
    farmerPasswordReset,
    farmerAlertHigh,
    farmerAlertMedium,
    farmerDiseaseDetected,
    farmerDeviceOffline,
    farmerDailyReport,
    farmerWeeklyReport,
    farmerNewDeviceLogin,
    adminNewFarmer,
    adminSystemCritical,
    adminGeminiEightyPercent,
    adminGeminiExceeded,
    adminPythonOffline,
    adminDeviceOffline24h,
    adminTrainingComplete,
    adminNewAdmin,
    adminWeeklyReport,
};