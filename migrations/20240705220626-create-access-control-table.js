'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('access_control', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      access_control_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      business_owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'business_owners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      access_allowed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('access_control');
  }
};
