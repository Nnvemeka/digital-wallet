'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Account.belongsTo(models.User)
      Account.hasMany(models.Transaction)
    }
  }
  Account.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(20, 4).UNSIGNED,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Account',
    underscored: true
  });
  return Account;
};