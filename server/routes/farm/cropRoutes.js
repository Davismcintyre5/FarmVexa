const router = require('express').Router();
const { createCrop, getFieldCrops, getCropById, updateCrop, deleteCrop } = require('../../controllers/farm/cropController');
const farmerAuth = require('../../middleware/farm/auth');
const { ownsField } = require('../../middleware/farm/farm');

router.use(farmerAuth);

router.post('/field/:fieldId', ownsField, createCrop);
router.get('/field/:fieldId', ownsField, getFieldCrops);
router.get('/:id', getCropById);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

module.exports = router;