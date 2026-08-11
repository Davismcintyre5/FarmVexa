const Usage = require('../../models/admin/Usage');
const User = require('../../models/farm/User');
const limitService = require('../../services/limitService');
const { successResponse, errorResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const getTotalUsage = asyncHandler(async (req, res) => {
    const usage = await limitService.getTotalUsage();
    return successResponse(res, { usage });
});

const getAllUsersUsage = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'farmer' }).select('name email phone');

    const usageData = [];
    for (const user of users) {
        const usage = await limitService.getUserUsage(user._id);
        usageData.push({
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
            usage,
        });
    }

    return successResponse(res, { users: usageData });
});

const getUserUsage = asyncHandler(async (req, res) => {
    const usage = await limitService.getUserUsage(req.params.id);
    const history = await Usage.find({ user: req.params.id })
        .sort({ requestTimestamp: -1 })
        .limit(50);

    return successResponse(res, { usage, history });
});

const updateLimits = asyncHandler(async (req, res) => {
    const Settings = require('../../models/admin/Settings');
    const { dailyLimitPerUser, dailyLimitTotal } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (dailyLimitPerUser) settings.gemini.dailyLimitPerUser = dailyLimitPerUser;
    if (dailyLimitTotal) settings.gemini.dailyLimitTotal = dailyLimitTotal;

    settings.updatedBy = req.user.id;
    await settings.save();

    return successResponse(res, { settings }, 'Limits updated');
});

module.exports = {
    getTotalUsage,
    getAllUsersUsage,
    getUserUsage,
    updateLimits,
};