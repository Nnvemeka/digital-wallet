'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CardTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
  }
  CardTransaction.init({
    external_reference: {
      type: DataTypes.UUID,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.NOW,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'card_transactions',
    underscored: true,
    timestamps: false
  });
  return CardTransaction;
};