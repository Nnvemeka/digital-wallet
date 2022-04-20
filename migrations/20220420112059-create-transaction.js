'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      txn_type: {
        allowNull: false,
        type: Sequelize.ENUM('debit', 'credit'),
      },
      purpose: {
        type: Sequelize.ENUM('deposit', 'transfer', 'withdrawal', 'reversal'),
        allowNull: false,
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(20, 4),
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id',
        },
      },
      reference: {
        type: Sequelize.UUID,
        allowNull: false
      },
      balance_before: {
        allowNull: false,
        type: Sequelize.DECIMAL(20, 4),
      },
      balance_after: {
        allowNull: false,
        type: Sequelize.DECIMAL(20, 4),
      },
      metadata: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};