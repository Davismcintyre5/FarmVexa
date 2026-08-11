const router = require('express').Router();
const { registerDevice, getFarmDevices, getDeviceById, updateDevice, deleteDevice } = require('../../controllers/farm/deviceController');
const farmerAuth = require('../../middleware/farm/auth');
const { ownsFarm } = require('../../middleware/farm/farm');

router.use(farmerAuth);

router.post('/farm/:farmId', ownsFarm, registerDevice);
router.get('/farm/:farmId', ownsFarm, getFarmDevices);
router.get('/:id', getDeviceById);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);

module.exports = router;