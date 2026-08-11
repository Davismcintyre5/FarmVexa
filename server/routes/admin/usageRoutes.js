const router = require('express').Router();
const { getTotalUsage, getAllUsersUsage, getUserUsage, updateLimits } = require('../../controllers/admin/usageController');
const adminAuth = require('../../middleware/admin/adminAuth');
const { requireRole } = require('../../middleware/admin/role');

router.use(adminAuth);

router.get('/total', getTotalUsage);
router.get('/users', getAllUsersUsage);
router.get('/user/:id', getUserUsage);
router.put('/limits', requireRole('super_admin'), updateLimits);

module.exports = router;