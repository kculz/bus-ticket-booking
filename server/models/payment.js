'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.User, { foreignKey: 'UserId' });
      Payment.belongsTo(models.Ticket, { foreignKey: 'TicketId' });
    }
  }
  Payment.init({
    paymentReference: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    paymentMethod: DataTypes.STRING,
    status: DataTypes.STRING,
    paynowPollUrl: DataTypes.STRING,
    paynowInitResponse: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};