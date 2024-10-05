'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('business_owners', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image_owner: {
        type: Sequelize.STRING
      },
      adresse: {
        type: Sequelize.STRING
      },
      telephone1: {
        type: Sequelize.STRING
      },
      telephone2: {
        type: Sequelize.STRING
      },
      monthly_fee_paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      role: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.UUID,
        unique: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      latest_payment_date: {
        type: Sequelize.DATE
      },
      latest_payment_id: {
        type: Sequelize.UUID
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('business_owners');
  }
};
