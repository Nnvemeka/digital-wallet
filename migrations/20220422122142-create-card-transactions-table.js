'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('card_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      external_reference: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(20, 4),
      },
      last_response: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('card_transactins');
  }
};
