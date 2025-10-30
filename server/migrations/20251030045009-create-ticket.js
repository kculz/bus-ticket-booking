'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticketNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      seatNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      passengerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      passengerEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      passengerPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      departure: {
        type: Sequelize.STRING,
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: false
      },
      travelDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      paymentMethod: {
        type: Sequelize.STRING
      },
      paynowReference: {
        type: Sequelize.STRING
      },
      BusId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Buses',
          key: 'id'
        }
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
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
    await queryInterface.dropTable('Tickets');
  }
};