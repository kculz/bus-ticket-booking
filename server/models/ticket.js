'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      Ticket.belongsTo(models.User, { foreignKey: 'UserId' });
      Ticket.belongsTo(models.Bus, { foreignKey: 'BusId' });
      Ticket.hasOne(models.Payment, { foreignKey: 'TicketId' });
    }
  }
  Ticket.init({
    ticketNumber: DataTypes.STRING,
    seatNumber: DataTypes.INTEGER,
    passengerName: DataTypes.STRING,
    passengerEmail: DataTypes.STRING,
    passengerPhone: DataTypes.STRING,
    departure: DataTypes.STRING,
    destination: DataTypes.STRING,
    travelDate: DataTypes.DATE,
    amount: DataTypes.DECIMAL,
    paymentStatus: DataTypes.STRING,
    paymentMethod: DataTypes.STRING,
    paynowReference: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ticket',
  });
  return Ticket;
};