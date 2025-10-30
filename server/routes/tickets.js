const express = require('express');
const { Ticket, Bus, User } = require('../models');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { sendTicketEmail } = require('../utils/emailService');

const router = express.Router();

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const {
      busId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seatNumber,
      userId
    } = req.body;

    // Check if bus exists and has available seats
    const bus = await Bus.findByPk(busId);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    if (bus.availableSeats <= 0) {
      return res.status(400).json({ error: 'No available seats on this bus' });
    }

    // Check if seat is already taken
    const existingTicket = await Ticket.findOne({
      where: {
        BusId: busId,
        seatNumber: seatNumber,
        paymentStatus: 'completed'
      }
    });

    if (existingTicket) {
      return res.status(400).json({ error: 'Seat already taken' });
    }

    // Generate ticket number
    const ticketNumber = generateTicketNumber();

    // Create ticket
    const ticket = await Ticket.create({
      ticketNumber,
      seatNumber,
      passengerName,
      passengerEmail,
      passengerPhone,
      departure: bus.route.split(' to ')[0],
      destination: bus.route.split(' to ')[1],
      travelDate: bus.departureTime,
      amount: bus.price,
      paymentStatus: 'pending',
      BusId: busId,
      UserId: userId
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating ticket' });
  }
});

// Get all tickets for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { UserId: req.params.userId },
      include: [Bus],
      order: [['createdAt', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching tickets' });
  }
});

// Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [Bus, User]
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching ticket' });
  }
});

// Confirm ticket payment and send email
router.post('/:id/confirm', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [Bus]
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket status
    ticket.paymentStatus = 'completed';
    await ticket.save();

    // Update bus available seats
    const bus = await Bus.findByPk(ticket.BusId);
    bus.availableSeats -= 1;
    await bus.save();

    // Send confirmation email
    await sendTicketEmail(ticket.passengerEmail, ticket);

    res.json({
      message: 'Ticket confirmed successfully',
      ticket
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error confirming ticket' });
  }
});

module.exports = router;