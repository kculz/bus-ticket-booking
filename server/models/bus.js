'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bus extends Model {
    static associate(models) {
      Bus.hasMany(models.Ticket, { foreignKey: 'BusId' });
    }
  }
  Bus.init({
    fleetNumber: DataTypes.STRING,
    busType: DataTypes.STRING,
    totalSeats: DataTypes.INTEGER,
    route: DataTypes.STRING,
    departureTime: DataTypes.DATE,
    arrivalTime: DataTypes.DATE,
    price: DataTypes.DECIMAL,
    availableSeats: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bus',
  });
  return Bus;
};