const { errorResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const Farm = require('../../models/farm/Farm');

const ownsFarm = asyncHandler(async (req, res, next) => {
    const farm = await Farm.findById(req.params.farmId || req.body.farmId);
    if (!farm) return errorResponse(res, 'Farm not found', 404);
    if (farm.owner.toString() !== req.user.id.toString()) return errorResponse(res, 'Not authorized', 403);
    req.farm = farm;
    next();
});

const ownsField = asyncHandler(async (req, res, next) => {
    const Field = require('../../models/farm/Field');
    const field = await Field.findById(req.params.fieldId || req.body.fieldId);
    if (!field) return errorResponse(res, 'Field not found', 404);
    const farm = await Farm.findOne({ _id: field.farm, owner: req.user.id });
    if (!farm) return errorResponse(res, 'Not authorized', 403);
    req.field = field;
    req.farm = farm;
    next();
});

module.exports = { ownsFarm, ownsField };