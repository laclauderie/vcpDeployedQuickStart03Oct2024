'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('commerces', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      commerce_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      business_owner_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'business_owners', // Name of the referenced table
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      ville_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'villes', // Name of the referenced table
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      image_commerce: {
        type: Sequelize.STRING,
        allowNull: true
      },
      services: {
        type: Sequelize.TEXT('long'), // Use TEXT for SQL Server
        allowNull: false,
        defaultValue: ''
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('commerces');
  }
};
