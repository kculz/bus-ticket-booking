const express = require('express');
const { Ticket, Bus, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get ticket sales and profits per bus
router.get('/bus-sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereCondition = {
      paymentStatus: 'completed'
    };

    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const busSales = await Ticket.findAll({
      where: whereCondition,
      include: [Bus],
      attributes: [
        'BusId',
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'ticketsSold'],
        [sequelize.fn('SUM', sequelize.col('Ticket.amount')), 'totalRevenue']
      ],
      group: ['BusId', 'Bus.id'],
      raw: true
    });

    // Calculate profits (assuming 70% profit margin for demo)
    const report = busSales.map(sale => ({
      busId: sale.BusId,
      fleetNumber: sale['Bus.fleetNumber'],
      route: sale['Bus.route'],
      ticketsSold: sale.ticketsSold,
      totalRevenue: parseFloat(sale.totalRevenue) || 0,
      profit: (parseFloat(sale.totalRevenue) || 0) * 0.7 // 70% profit margin
    }));

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating sales report' });
  }
});

// Get daily sales summary
router.get('/daily-summary', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const dailySummary = await Ticket.findAll({
      where: {
        paymentStatus: 'completed',
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTickets'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue']
      ],
      raw: true
    });

    const summary = {
      date: startOfDay.toISOString().split('T')[0],
      totalTickets: parseInt(dailySummary[0]?.totalTickets) || 0,
      totalRevenue: parseFloat(dailySummary[0]?.totalRevenue) || 0,
      totalProfit: (parseFloat(dailySummary[0]?.totalRevenue) || 0) * 0.7
    };

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating daily summary' });
  }
});

// Get bus occupancy rates
router.get('/occupancy-rates', async (req, res) => {
  try {
    const buses = await Bus.findAll({
      include: [{
        model: Ticket,
        where: { paymentStatus: 'completed' },
        required: false,
        attributes: []
      }],
      attributes: [
        'id',
        'fleetNumber',
        'route',
        'totalSeats',
        'availableSeats',
        [sequelize.fn('COUNT', sequelize.col('Tickets.id')), 'occupiedSeats']
      ],
      group: ['Bus.id']
    });

    const occupancyRates = buses.map(bus => {
      const occupiedSeats = parseInt(bus.get('occupiedSeats'));
      const totalSeats = bus.totalSeats;
      const occupancyRate = (occupiedSeats / totalSeats) * 100;

      return {
        busId: bus.id,
        fleetNumber: bus.fleetNumber,
        route: bus.route,
        totalSeats,
        occupiedSeats,
        availableSeats: bus.availableSeats,
        occupancyRate: Math.round(occupancyRate)
      };
    });

    res.json(occupancyRates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating occupancy rates' });
  }
});

module.exports = router;