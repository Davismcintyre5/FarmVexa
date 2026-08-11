const router = require('express').Router();
const { createFarm, getMyFarms, getFarmById, updateFarm, deleteFarm } = require('../../controllers/farm/farmController');
const farmerAuth = require('../../middleware/farm/auth');
const { ownsFarm } = require('../../middleware/farm/farm');

router.use(farmerAuth);

router.post('/', createFarm);
router.get('/', getMyFarms);
router.get('/:id', getFarmById);
router.put('/:id', ownsFarm, updateFarm);
router.delete('/:id', ownsFarm, deleteFarm);

module.exports = router;