'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Buses', [
      {
        fleetNumber: 'BUS001',
        busType: 'Luxury Coach',
        totalSeats: 40,
        availableSeats: 40,
        route: 'Harare to Bulawayo',
        departureTime: new Date('2024-01-15 08:00:00'),
        arrivalTime: new Date('2024-01-15 14:00:00'),
        price: 35.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fleetNumber: 'BUS002',
        busType: 'Standard',
        totalSeats: 35,
        availableSeats: 35,
        route: 'Harare to Mutare',
        departureTime: new Date('2024-01-15 09:00:00'),
        arrivalTime: new Date('2024-01-15 12:30:00'),
        price: 25.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fleetNumber: 'BUS003',
        busType: 'Executive',
        totalSeats: 28,
        availableSeats: 28,
        route: 'Bulawayo to Victoria Falls',
        departureTime: new Date('2024-01-15 07:30:00'),
        arrivalTime: new Date('2024-01-15 13:00:00'),
        price: 45.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Buses', null, {});
  }
};