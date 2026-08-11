const cron = require('node-cron');
const Alert = require('../models/farm/Alert');
const NotificationLog = require('../models/farm/NotificationLog');
const Farm = require('../models/farm/Farm');
const User = require('../models/farm/User');
const emailTemplates = require('../templates/emailTemplates');
const smsTemplates = require('../templates/smsTemplates');
const { sendEmail } = require('../config/hdmBridge');
const { sendSMS } = require('../config/brevo');
const Settings = require('../models/admin/Settings');
const logger = require('../utils/logger');

let task = null;

const start = () => {
    task = cron.schedule('*/2 * * * *', async () => {
        logger.debug('Processing pending alerts...');

        try {
            const pendingAlerts = await Alert.find({
                $or: [{ sentSMS: false }, { sentEmail: false }],
                severity: { $in: ['high', 'critical'] },
            }).limit(10);

            for (const alert of pendingAlerts) {
                const farm = await Farm.findById(alert.farm).populate('owner');
                if (!farm || !farm.owner) continue;

                const user = farm.owner;
                const settings = await Settings.findOne();

                if (!alert.sentSMS && user.phone) {
                    try {
                        const smsMsg = await smsTemplates.farmerAlertHigh(
                            user,
                            { message: alert.message, farmName: farm.name },
                            settings
                        );
                        await sendSMS(user.phone, smsMsg);
                        alert.sentSMS = true;

                        await NotificationLog.create({
                            alert: alert._id,
                            user: user._id,
                            type: 'sms',
                            recipient: user.phone,
                            message: smsMsg,
                            status: 'sent',
                        });
                    } catch (error) {
                        await NotificationLog.create({
                            alert: alert._id,
                            user: user._id,
                            type: 'sms',
                            recipient: user.phone,
                            status: 'failed',
                            errorMessage: error.message,
                        });
                    }
                }

                if (!alert.sentEmail) {
                    try {
                        const emailTemplate = await emailTemplates.farmerAlertHigh(
                            user,
                            { message: alert.message, farmName: farm.name, recommendation: alert.recommendation },
                            settings
                        );
                        await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
                        alert.sentEmail = true;

                        await NotificationLog.create({
                            alert: alert._id,
                            user: user._id,
                            type: 'email',
                            recipient: user.email,
                            subject: emailTemplate.subject,
                            message: emailTemplate.html,
                            status: 'sent',
                        });
                    } catch (error) {
                        await NotificationLog.create({
                            alert: alert._id,
                            user: user._id,
                            type: 'email',
                            recipient: user.email,
                            status: 'failed',
                            errorMessage: error.message,
                        });
                    }
                }

                await alert.save();
            }
        } catch (error) {
            logger.error(`Alert scheduler error: ${error.message}`);
        }
    });
};

const stop = () => {
    if (task) task.stop();
};

module.exports = { start, stop };