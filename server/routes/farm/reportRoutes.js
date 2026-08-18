const router = require('express').Router();
const { getReport } = require('../../controllers/farm/reportController');
const farmerAuth = require('../../middleware/farm/auth');
const subscriptionCheck = require('../../middleware/farm/subscriptionCheck');
const { ownsFarm } = require('../../middleware/farm/farm');

router.use(farmerAuth);
router.use(subscriptionCheck);
router.get('/farm/:farmId', ownsFarm, getReport);

module.exports = router;