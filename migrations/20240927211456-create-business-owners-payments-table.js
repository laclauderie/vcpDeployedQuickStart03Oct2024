// /vcpBackend/migrations/20240705223514-create-business-owners-payments-table.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('business_owners_payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      business_owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'business_owners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        /* references: {
          model: 'payments',
          key: 'payment_id'
        },
        onDelete: 'CASCADE' */
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('business_owners_payments');
  }
};

