// vcpBackend/src/controllers/paymentController.js
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/sequelize');
const Payments = require('../models/paymentsModel');
const BusinessOwner = require('../models/businessOwnersModel');
const BusinessOwnersPayments = require('../models/businessOwnersPaymentsModel');
const AccessControl = require('../models/accessControlModel');

// Function to calculate expiry date based on durationMonths
const calculateExpiryDate = (durationMonths) => {
    let daysToAdd;
    if (durationMonths === 0.1) {
        daysToAdd = 3; // 0.1 month is approximately 3 days
    } else if (durationMonths === 0.5) {
        daysToAdd = 15; // 0.5 month is approximately 15 days
    } else {
        daysToAdd = Math.floor(durationMonths * 30); // Assuming 30 days in a month
    }
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysToAdd);
    return expiryDate;
}

// Function to create a new payment
const createNewPayment = async (businessOwner, amount, durationMonths, transaction) => {
    const expiryDate = calculateExpiryDate(durationMonths);

    const payment = await Payments.create({
        payment_id: uuidv4(),
        business_owner_id: businessOwner.id,
        amount,
        duration_months: durationMonths,
        payment_date: new Date(),
        expiry_date: expiryDate,
        latest_payment: true
    }, { transaction });

    await BusinessOwnersPayments.create({
        business_owner_id: businessOwner.id,
        payment_id: payment.payment_id,
        createdAt: new Date(),
        updatedAt: new Date()
    }, { transaction });

    await AccessControl.create({
        access_control_id: uuidv4(),
        business_owner_id: businessOwner.id,
        access_allowed: true
    }, { transaction });

    // Update latest payment fields in BusinessOwner
    await businessOwner.update({
        latest_payment_date: payment.payment_date,
        latest_payment_id: payment.payment_id,
        monthly_fee_paid: true // Mark the monthly fee as paid
    }, { transaction });

    return payment;
};

const renewPayment = async (businessOwner, amount, durationMonths, transaction) => {
    const expiryDate = calculateExpiryDate(durationMonths);

    try {
        // Find the current latest payment record
        const currentLatestPayment = await Payments.findOne({
            where: {
                business_owner_id: businessOwner.id,
                latest_payment: true
            },
            transaction
        });

        // If no current latest payment record is found, throw an error
        if (!currentLatestPayment) {
            throw { status: 404, message: 'No existing payment found to renew' };
        }

        // Check if the current payment has expired
        const currentDate = new Date();
        if (new Date(currentLatestPayment.expiry_date) > currentDate) {
            throw { status: 400, message: 'Cannot renew payment before the current payment expires' };
        }

        // Mark the current latest payment as not the latest
        await currentLatestPayment.update({ latest_payment: false }, { transaction });

        // Create a new payment record
        const payment = await Payments.create({
            payment_id: uuidv4(),
            business_owner_id: businessOwner.id,
            amount,
            duration_months: durationMonths,
            payment_date: new Date(),
            expiry_date: expiryDate,
            latest_payment: true
        }, { transaction });

        // Update the existing BusinessOwnersPayments record
        await BusinessOwnersPayments.update({
            payment_id: payment.payment_id,
            updatedAt: new Date()
        }, {
            where: { business_owner_id: businessOwner.id },
            transaction
        });

        // Update or create the AccessControl record
        const accessControl = await AccessControl.findOne({ where: { business_owner_id: businessOwner.id }, transaction });
        if (accessControl) {
            await accessControl.update({ access_allowed: true }, { transaction });
        } else {
            await AccessControl.create({
                access_control_id: uuidv4(),
                business_owner_id: businessOwner.id,
                access_allowed: true
            }, { transaction });
        }

        // Update the BusinessOwner with the new latest payment details
        await businessOwner.update({
            latest_payment_date: payment.payment_date,
            latest_payment_id: payment.payment_id,
            monthly_fee_paid: true
        }, { transaction });

        return payment;
    } catch (error) {
        throw { status: error.status || 500, message: error.message || 'An error occurred while processing the payment' };
    }
};

module.exports = renewPayment;


// Function to create a new payment or renew an existing one
const createOrRenewPayment = async (req, res) => {
    const { amount, durationMonths } = req.body;

    try {
        // Get userId from authenticated user
        const userId = req.user.userId;

        // Find the business owner by user ID
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ message: 'Business owner not found' });
        }

        // Transaction handling
        const transaction = await sequelize.transaction();
        try {
            // Check if this is the first payment or a renewal
            const hasPayments = await Payments.count({
                where: { business_owner_id: businessOwner.id },
                transaction
            });

            let payment;
            if (hasPayments === 0) {
                // First payment
                payment = await createNewPayment(businessOwner, amount, durationMonths, transaction);
            } else {
                // Renew payment
                payment = await renewPayment(businessOwner, amount, durationMonths, transaction);
            }

            await transaction.commit();
            res.status(200).json({ message: 'Payment processed successfully', payment });

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing the payment' });
    }
};

// Function to retrieve all payments for the logged-in business owner
const getPaymentsForBusinessOwner = async (req, res) => {
    const userId = req.user.userId; // Get the logged-in user's ID from the JWT

    try {
        // Check if the business owner exists
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ message: 'Business owner not found' });
        }

        const payments = await Payments.findAll({
            where: { business_owner_id: businessOwner.id },
            order: [['payment_date', 'DESC']]
        });

        if (payments.length === 0) {
            return res.status(404).json({ message: 'No payments found for this business owner' });
        }

        res.status(200).json(payments);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving payments' });
    }
};

// Function to retrieve the current payment for the logged-in business owner
const getCurrentPaymentForBusinessOwner = async (req, res) => {
    const userId = req.user.userId; // Get the logged-in user's ID from the JWT

    try {
        // Check if the business owner exists
        const businessOwner = await BusinessOwner.findOne({ where: { user_id: userId } });
        if (!businessOwner) {
            return res.status(404).json({ message: 'Business owner not found' });
        }

        const payment = await Payments.findOne({
            where: { business_owner_id: businessOwner.id, latest_payment: true },
            order: [['payment_date', 'DESC']]
        });

        if (!payment) {
            return res.status(404).json({ message: 'No current payment found for this business owner' });
        }

        // Calculate remaining days before expiry
        const currentDate = new Date();
        const expiryDate = new Date(payment.expiry_date);
        const remainingDays = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

        res.status(200).json({
            payment,
            remainingDays
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving the current payment' });
    }
};

module.exports = {
    createOrRenewPayment,
    getPaymentsForBusinessOwner,
    getCurrentPaymentForBusinessOwner
};
