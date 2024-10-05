const cron = require('node-cron');
const { Op } = require('sequelize'); // Import Sequelize operators
const sequelize = require('../config/sequelize');
const Payments = require('../models/paymentsModel');
const BusinessOwnersPayments = require('../models/businessOwnersPaymentsModel');
const AccessControl = require('../models/accessControlModel');
const BusinessOwner = require('../models/businessOwnersModel'); // Ensure correct path

const expirePaymentsJob = async () => {
    let transaction;
    try {
        // Start a transaction
        transaction = await sequelize.transaction();

        // Get all expired payments
        const expiredPayments = await BusinessOwnersPayments.findAll({
            include: [{
                model: Payments,
                where: {
                    expiry_date: {
                        [Op.lt]: new Date() // Use Op.lt
                    }
                }
            }],
            transaction
        });

        for (const record of expiredPayments) {
            const { business_owner_id } = record;

            // Update access_control
            const accessControl = await AccessControl.findOne({ where: { business_owner_id }, transaction });
            if (accessControl) {
                if (accessControl.access_allowed) {
                    await accessControl.update({ access_allowed: false }, { transaction });
                }
            } else {
                console.warn(`No access control found for business owner ID ${business_owner_id}`);
            }

            // Update business_owners
            const businessOwner = await BusinessOwner.findByPk(business_owner_id, { transaction });
            if (businessOwner) {
                if (businessOwner.monthly_fee_paid) {
                    await businessOwner.update({ monthly_fee_paid: false }, { transaction });
                }
            } else {
                console.warn(`No business owner found for ID ${business_owner_id}`);
            }
        }

        // Additional check: Ensure consistency
        const accessControls = await AccessControl.findAll({ where: { access_allowed: false }, transaction });
        for (const accessControl of accessControls) {
            const { business_owner_id } = accessControl;

            const businessOwner = await BusinessOwner.findByPk(business_owner_id, { transaction });
            if (businessOwner && businessOwner.monthly_fee_paid) {
                await businessOwner.update({ monthly_fee_paid: false }, { transaction });
            }
        }

        // Commit the transaction
        await transaction.commit();
        console.log('Expire payments job executed successfully.');
    } catch (error) {
        console.error('Error executing expire payments job:', error);
        if (transaction) await transaction.rollback();
    }
};

// Schedule the job to run every day at midnight
cron.schedule('0 0 * * *', expirePaymentsJob);

module.exports = expirePaymentsJob;
