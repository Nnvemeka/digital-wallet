'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('transactions', 'purpose', {
      type: Sequelize.ENUM('deposit', 'transfer', 'reversal', 'card_funding'),
      allowNull: true,
    })

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('transactions', 'purpose', {
      type: Sequelize.ENUM('deposit', 'transfer', 'reversal'),
      allowNull: false,
    })
  }
};
