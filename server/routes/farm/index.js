const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/farms', require('./farmRoutes'));
router.use('/fields', require('./fieldRoutes'));
router.use('/crops', require('./cropRoutes'));
router.use('/devices', require('./deviceRoutes'));
router.use('/sensors', require('./sensorRoutes'));
router.use('/images', require('./imageRoutes'));
router.use('/alerts', require('./alertRoutes'));
router.use('/chat', require('./chatRoutes'));

module.exports = router;