const { Paynow } = require("paynow");
const EmailService = require('../utils/emailService'); // Import the email service

// Debug environment variables
console.log('🔧 [Paynow] Environment check:', {
  integrationId: process.env.PAYNOW_INTEGRATION_ID ? 'SET' : 'MISSING',
  integrationKey: process.env.PAYNOW_INTEGRATION_KEY ? 'SET' : 'MISSING',
  baseUrl: process.env.BASE_URL,
  frontendUrl: process.env.FRONTEND_URL
});

// Validate required environment variables
if (!process.env.PAYNOW_INTEGRATION_ID || !process.env.PAYNOW_INTEGRATION_KEY) {
  console.error('❌ [Paynow] Missing required environment variables:');
  console.error('   - PAYNOW_INTEGRATION_ID:', process.env.PAYNOW_INTEGRATION_ID ? 'SET' : 'MISSING');
  console.error('   - PAYNOW_INTEGRATION_KEY:', process.env.PAYNOW_INTEGRATION_KEY ? 'SET' : 'MISSING');
  throw new Error('PayNow integration ID and Key are required');
}

// Initialize Paynow with validation
let paynow;
try {
  paynow = new Paynow(
    process.env.PAYNOW_INTEGRATION_ID, 
    process.env.PAYNOW_INTEGRATION_KEY
  );

  // Set URLs with fallbacks
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  paynow.resultUrl = `${baseUrl}/api/payments/webhook`;
  paynow.returnUrl = `${frontendUrl}/tickets`;

  console.log('✅ [Paynow] Initialized successfully');
  console.log('🔧 [Paynow] URLs:', {
    resultUrl: paynow.resultUrl,
    returnUrl: paynow.returnUrl
  });
} catch (error) {
  console.error('❌ [Paynow] Initialization failed:', error);
  throw error;
}

const { Ticket, Bus, Payment, User, sequelize } = require('../models');

const PaymentController = {
  // Process EcoCash payment for ticket
  async processEcocashPayment(req, res) {
    // Validate PayNow configuration first
    if (!paynow) {
      return res.status(500).json({ 
        error: 'Payment service not configured properly' 
      });
    }

    try {
      const { ticketId, phoneNumber, userId } = req.body;

      console.log('💰 [Paynow] Processing EcoCash payment for ticket:', { 
        ticketId, 
        phoneNumber, 
        userId,
        reqUser: req.user // Debug the user object
      });

      // Validate required parameters
      if (!ticketId) {
        return res.status(400).json({ error: 'Ticket ID is required' });
      }

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      // Determine the user ID - try from req.user first, then from request body
      const currentUserId = req.user?.id || userId;
      
      if (!currentUserId) {
        console.error('❌ [Paynow] No user ID found in request');
        return res.status(401).json({ error: 'User authentication required' });
      }

      console.log('👤 [Paynow] Using user ID:', currentUserId);

      // Validate ticket exists and belongs to user
      const ticket = await Ticket.findOne({
        where: {
          id: ticketId,
          UserId: currentUserId
        },
        include: [Bus]
      });

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found or does not belong to user' });
      }

      if (ticket.paymentStatus === 'completed') {
        return res.status(400).json({ error: 'Ticket already paid' });
      }

      // Basic phone number validation for Zimbabwe
      const zimbabweRegex = /^(\+263|0)(7)(7|8|1|3)\d{7}$/;
      if (!zimbabweRegex.test(phoneNumber)) {
        return res.status(400).json({ error: 'Please provide a valid Zimbabwean phone number' });
      }

      // Normalize phone number
      const normalizedPhone = phoneNumber.startsWith('+263') 
        ? phoneNumber 
        : phoneNumber.replace(/^0/, '+263');

      console.log('📱 [Paynow] Using phone:', normalizedPhone);

      // Generate unique reference
      const generateReference = () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `TKT${ticketId}${timestamp}${random}`.toUpperCase();
      };

      const reference = generateReference();
      console.log('📄 [Paynow] Generated reference:', reference);

      // Create payment with additional validation
      try {
        const payment = paynow.createPayment(reference, ticket.passengerEmail || 'passenger@zupco.co.zw');
        
        // Add ticket as payment item
        const itemName = `Bus Ticket: ${ticket.departure} to ${ticket.destination}`;
        const amount = parseFloat(ticket.amount);
        
        if (isNaN(amount) || amount <= 0) {
          return res.status(400).json({ error: 'Invalid ticket amount' });
        }

        payment.add(itemName, amount);

        console.log('💰 [Paynow] Payment details:', {
          reference: payment.reference,
          amount: amount,
          item: itemName,
          email: ticket.passengerEmail
        });

        // Send mobile payment request
        console.log('📤 [Paynow] Sending EcoCash payment request...');
        const response = await paynow.sendMobile(payment, normalizedPhone, 'ecocash');

        console.log('✅ [Paynow] Payment response:', {
          success: response.success,
          reference: response.reference,
          pollUrl: response.pollUrl,
          error: response.error,
          instructions: response.instructions
        });

        if (response.success) {
          // Use the reference from our generated one if PayNow returns undefined
          const paymentReference = response.reference || reference;
          console.log('🔑 [Paynow] Using payment reference:', paymentReference);

          // Create payment record - include ALL required fields
          const paymentRecord = await Payment.create({
            paymentReference: paymentReference,
            amount: amount,
            paymentMethod: 'ecocash',
            status: 'pending',
            paynowPollUrl: response.pollUrl,
            paynowInitResponse: JSON.stringify(response),
            TicketId: ticket.id,
            UserId: currentUserId
          });

          // Update ticket with payment reference
          await ticket.update({
            paynowReference: paymentReference,
            paymentMethod: 'ecocash',
            paymentStatus: 'pending'
          });

          res.json({
            success: true,
            message: 'Payment initiated successfully',
            instructions: response.instructions,
            pollUrl: response.pollUrl,
            reference: paymentReference,
            paymentId: paymentRecord.id,
            ticketId: ticket.id
          });
        } else {
          console.error('❌ [Paynow] Payment initiation failed:', response.error);
          res.status(400).json({
            success: false,
            error: 'Failed to initiate payment',
            details: response.error
          });
        }
      } catch (paynowError) {
        console.error('❌ [Paynow] PayNow API error:', paynowError);
        res.status(500).json({ 
          error: 'Payment service error',
          message: paynowError.message 
        });
      }
    } catch (error) {
      console.error('❌ [Paynow] EcoCash payment error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  },

  // Check payment status - make it public or handle authentication differently
  async checkPaymentStatus(req, res) {
    try {
      const { reference } = req.params;

      console.log('🔍 [Backend] Checking payment status for:', reference);

      // Find payment by reference - no user restriction for status checks
      const payment = await Payment.findOne({
        where: { paymentReference: reference },
        include: [{
          model: Ticket,
          include: [Bus]
        }]
      });

      if (!payment) {
        console.error('❌ [Backend] Payment not found:', reference);
        return res.status(404).json({ 
          status: 'error',
          error: 'Payment not found' 
        });
      }

      console.log('✅ [Backend] Payment found:', {
        paymentId: payment.id,
        currentStatus: payment.status,
        ticketId: payment.Ticket?.id
      });

      // If payment is already completed, return immediately
      if (payment.status === 'completed') {
        console.log('💰 [Backend] Payment already completed');
        return res.json({ 
          status: 'completed',
          success: true,
          message: 'Payment already completed',
          ticket: payment.Ticket
        });
      }

      if (payment.status === 'failed' || payment.status === 'cancelled') {
        console.log('❌ [Backend] Payment already failed/cancelled:', payment.status);
        return res.json({ 
          status: payment.status,
          success: false,
          message: `Payment has been ${payment.status}`
        });
      }

      // Poll Paynow for status if we have a poll URL
      if (payment.paynowPollUrl) {
        console.log('📡 [Backend] Polling Paynow URL:', payment.paynowPollUrl);
        try {
          const statusResponse = await paynow.pollTransaction(payment.paynowPollUrl);

          console.log('📊 [Backend] Paynow status response:', {
            status: statusResponse.status,
            success: statusResponse.success,
            error: statusResponse.error
          });

          let updateData = {
            status: statusResponse.status,
            success: statusResponse.success,
            error: statusResponse.error || null,
            message: ''
          };

          // Handle different statuses from Paynow
          if ((statusResponse.status === 'paid' || statusResponse.status === 'completed') && statusResponse.success === true) {
            console.log('✅ [Backend] Payment confirmed as paid');
            
            // Update payment status
            await payment.update({ status: 'completed' });
            
            // Update ticket status
            if (payment.Ticket) {
              await payment.Ticket.update({ 
                paymentStatus: 'completed',
                paymentMethod: 'ecocash'
              });
              
              // Update bus available seats
              const bus = await Bus.findByPk(payment.Ticket.BusId);
              if (bus) {
                bus.availableSeats -= 1;
                await bus.save();
              }

              // Send confirmation emails (don't await - send in background)
              this.sendPaymentConfirmationEmails(payment, payment.Ticket)
                .then(() => {
                  console.log('✅ Payment confirmation emails sent successfully');
                })
                .catch(emailError => {
                  console.error('❌ Error sending confirmation emails:', emailError);
                  // Don't throw error - payment is still successful even if email fails
                });
            }
            
            updateData.message = 'Payment successful';
            updateData.ticket = payment.Ticket;
            
          } else if (statusResponse.status === 'cancelled') {
            console.log('❌ [Backend] Payment cancelled');
            
            await payment.update({ status: 'cancelled' });
            updateData.message = 'Payment cancelled';
            updateData.success = false;
            
          } else if (statusResponse.status === 'failed') {
            console.log('❌ [Backend] Payment failed');
            
            await payment.update({ status: 'failed' });
            updateData.message = 'Payment failed';
            updateData.success = false;
            
          } else if (statusResponse.status === 'sent' || statusResponse.status === 'created') {
            console.log('🔄 [Backend] Payment in intermediate state:', statusResponse.status);
            
            updateData.message = 'Payment request sent - waiting for authorization';
            updateData.success = false;
            
          } else {
            console.log('🔄 [Backend] Payment still pending:', statusResponse.status);
            
            updateData.message = 'Payment still pending';
            updateData.success = false;
          }

          console.log('📤 [Backend] Sending status response:', updateData);
          return res.json(updateData);

        } catch (pollError) {
          console.error('❌ [Backend] Error polling Paynow:', pollError);
          
          // Return pending status but with error information
          return res.json({ 
            status: 'pending',
            success: false,
            error: pollError.message,
            message: 'Unable to check payment status, please try again later'
          });
        }
      } else {
        // No poll URL available
        return res.json({
          status: 'pending',
          success: false,
          message: 'Waiting for payment confirmation'
        });
      }
    } catch (error) {
      console.error('❌ [Backend] Payment status check error:', error);
      res.status(500).json({ 
        status: 'error',
        success: false,
        error: error.message,
        message: 'Failed to check payment status'
      });
    }
  },

  // Webhook handler for Paynow
  async handlePaynowWebhook(req, res) {
    try {
      const { reference, status, pollurl } = req.body;

      console.log('🔔 [Webhook] Paynow webhook received:', { 
        reference, 
        status,
        pollurl
      });

      if (!reference || !status) {
        console.error('❌ [Webhook] Missing reference or status');
        return res.status(400).send('Missing reference or status');
      }

      // Find payment by reference
      const payment = await Payment.findOne({
        where: { paymentReference: reference },
        include: [Ticket]
      });

      if (!payment) {
        console.error('❌ [Webhook] Payment not found for reference:', reference);
        return res.status(404).send('Payment not found');
      }

      console.log('✅ [Webhook] Payment found:', {
        paymentId: payment.id,
        currentStatus: payment.status,
        ticketId: payment.Ticket?.id
      });

      let updated = false;

      // Handle different statuses
      switch (status.toLowerCase()) {
        case 'paid':
        case 'completed':
          if (payment.status !== 'completed') {
            await payment.update({ status: 'completed' });
            
            if (payment.Ticket) {
              await payment.Ticket.update({ 
                paymentStatus: 'completed'
              });
              
              // Update bus available seats
              const bus = await Bus.findByPk(payment.Ticket.BusId);
              if (bus) {
                bus.availableSeats -= 1;
                await bus.save();
              }

              // Send confirmation emails (don't await - send in background)
              this.sendPaymentConfirmationEmails(payment, payment.Ticket)
                .then(() => {
                  console.log('✅ Webhook: Payment confirmation emails sent successfully');
                })
                .catch(emailError => {
                  console.error('❌ Webhook: Error sending confirmation emails:', emailError);
                });
            }
            
            console.log('💰 [Webhook] Payment marked as paid:', reference);
            updated = true;
          }
          break;

        case 'cancelled':
          if (payment.status !== 'cancelled') {
            await payment.update({ status: 'cancelled' });
            console.log('❌ [Webhook] Payment marked as cancelled:', reference);
            updated = true;
          }
          break;

        case 'failed':
          if (payment.status !== 'failed') {
            await payment.update({ status: 'failed' });
            console.log('⚠️ [Webhook] Payment marked as failed:', reference);
            updated = true;
          }
          break;

        default:
          console.log('🔄 [Webhook] Payment in state:', status);
          break;
      }

      if (updated) {
        console.log('✅ [Webhook] Successfully updated payment:', {
          reference,
          newStatus: status
        });
      }

      res.status(200).send('OK');

    } catch (error) {
      console.error('❌ [Webhook] Webhook processing error:', error);
      res.status(200).send('Error processed');
    }
  },

  // Helper method to send payment confirmation emails
  async sendPaymentConfirmationEmails(payment, ticket) {
    try {
      console.log('📧 Sending payment confirmation emails for ticket:', ticket.ticketNumber);
      
      // Send ticket confirmation email
      await EmailService.sendTicketEmail(ticket.passengerEmail, ticket);
      
      // Send payment confirmation email
      await EmailService.sendPaymentConfirmation(ticket.passengerEmail, payment, ticket);
      
      console.log('✅ All payment confirmation emails sent successfully');
    } catch (error) {
      console.error('❌ Error in sendPaymentConfirmationEmails:', error);
      throw error; // Re-throw to let caller handle it
    }
  },

  // Get payment history for user - requires authentication
  async getPaymentHistory(req, res) {
    try {
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      const payments = await Payment.findAll({
        where: { UserId: currentUserId },
        include: [Ticket],
        order: [['createdAt', 'DESC']]
      });

      res.json(payments);
    } catch (error) {
      console.error('Payment history error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch payment history'
      });
    }
  },

  // Test PayNow configuration
  async testConfiguration(req, res) {
    try {
      const config = {
        integrationId: process.env.PAYNOW_INTEGRATION_ID ? 'SET' : 'MISSING',
        integrationKey: process.env.PAYNOW_INTEGRATION_KEY ? 'SET' : 'MISSING',
        baseUrl: process.env.BASE_URL,
        frontendUrl: process.env.FRONTEND_URL,
        paynowInitialized: !!paynow
      };

      console.log('🔧 [Paynow] Configuration test:', config);
      res.json(config);
    } catch (error) {
      console.error('❌ [Paynow] Configuration test failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = PaymentController;