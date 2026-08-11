const cron = require('node-cron');
const sensorCheckScheduler = require('./sensorCheckScheduler');
const alertScheduler = require('./alertScheduler');
const reportScheduler = require('./reportScheduler');
const deviceHealthScheduler = require('./deviceHealthScheduler');
const dataCleanupScheduler = require('./dataCleanupScheduler');
const logger = require('../utils/logger');

const startSchedulers = () => {
    logger.info('📅 Starting schedulers...');

    sensorCheckScheduler.start();
    alertScheduler.start();
    reportScheduler.start();
    deviceHealthScheduler.start();
    dataCleanupScheduler.start();

    logger.info('✅ All schedulers started');
};

const stopSchedulers = () => {
    sensorCheckScheduler.stop();
    alertScheduler.stop();
    reportScheduler.stop();
    deviceHealthScheduler.stop();
    dataCleanupScheduler.stop();

    logger.info('🛑 All schedulers stopped');
};

module.exports = { startSchedulers, stopSchedulers };