const express = require('express');
const { Bus, Ticket } = require('../models');

const router = express.Router();

// Get all buses
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.findAll();
    res.json(buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching buses' });
  }
});

// Get available buses by route and date
router.get('/available', async (req, res) => {
  try {
    const { route, date } = req.query;
    
    const buses = await Bus.findAll({
      where: {
        route,
        availableSeats: { [Op.gt]: 0 }
      }
    });

    res.json(buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching available buses' });
  }
});

// Get bus by ID
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findByPk(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching bus' });
  }
});

// Get occupied seats for a bus
router.get('/:id/occupied-seats', async (req, res) => {
  try {
    const busId = req.params.id;
    
    const occupiedSeats = await Ticket.findAll({
      where: { 
        BusId: busId,
        paymentStatus: 'completed'
      },
      attributes: ['seatNumber']
    });

    const occupiedSeatNumbers = occupiedSeats.map(ticket => ticket.seatNumber);
    res.json(occupiedSeatNumbers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching occupied seats' });
  }
});

module.exports = router;
