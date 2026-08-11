const { sendSMS } = require('../config/brevo');
const smsTemplates = require('../templates/smsTemplates');
const Settings = require('../models/admin/Settings');
const logger = require('../utils/logger');

class SMSService {
    async send(to, templateName, data) {
        try {
            const settings = await Settings.findOne();
            if (!settings) return { skipped: true, reason: 'No settings found' };

            if (!settings.sms?.enabled) {
                return { skipped: true, reason: 'SMS disabled' };
            }

            const toggle = settings.smsToggles?.[templateName];
            if (toggle === false) {
                return { skipped: true, reason: `Template "${templateName}" is toggled off` };
            }

            const templateFn = smsTemplates[templateName];
            if (!templateFn) {
                throw new Error(`SMS template "${templateName}" not found`);
            }

            const message = await templateFn(data.user, data, settings);
            const result = await sendSMS(to, message);

            logger.info(`SMS sent: ${templateName} -> ${to}`);
            return result;
        } catch (error) {
            logger.error(`SMS send failed (${templateName}): ${error.message}`);
            throw error;
        }
    }
}

module.exports = new SMSService();