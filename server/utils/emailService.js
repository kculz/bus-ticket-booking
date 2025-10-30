require("dotenv").config();
const nodemailer = require("nodemailer");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "mail.curlben.com",
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "no-reply@curlben.com",
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

const EmailService = {
  // Send ticket confirmation email
  async sendTicketEmail(email, ticket) {
    const mailOptions = {
      from: `"ZUPCO Bus Services" <${process.env.EMAIL_USER || 'no-reply@curlben.com'}>`,
      to: email,
      subject: `Bus Ticket Confirmation - ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #0ea5e9; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">ZUPCO</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Bus Ticket Confirmation</p>
              </div>
            </div>
            
            <!-- Ticket Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin-top: 0;">Ticket Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Ticket Number:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50; font-weight: bold;">${ticket.ticketNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Passenger Name:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50;">${ticket.passengerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Route:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50;">${ticket.departure} → ${ticket.destination}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Travel Date:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50;">${new Date(ticket.travelDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Departure Time:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50;">
                    ${ticket.Bus ? new Date(ticket.Bus.departureTime).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Seat Number:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50; font-weight: bold; font-size: 18px;">${ticket.seatNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Bus Fleet:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50;">${ticket.Bus ? ticket.Bus.fleetNumber : 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Bus Type:</strong></td>
                  <td style="padding: 8px 0; color: #2c3e50;">${ticket.Bus ? ticket.Bus.busType : 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 8px 0; color: #0ea5e9; font-weight: bold; font-size: 18px;">$${ticket.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0;">
                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Important Notes -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #856404; margin-top: 0;">📋 Important Information</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Please arrive at the bus station 30 minutes before departure</li>
                <li>Bring a valid ID that matches the passenger name</li>
                <li>Present this ticket (digital or printed) at boarding</li>
                <li>Seat allocation is final and cannot be changed</li>
              </ul>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0;">Thank you for choosing <strong>ZUPCO Bus Services</strong></p>
              <p style="margin: 5px 0;">For inquiries, contact: support@zupco.co.zw</p>
              <p style="margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} ZUPCO. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
      text: `
ZUPCO BUS TICKET CONFIRMATION

Ticket Number: ${ticket.ticketNumber}
Passenger: ${ticket.passengerName}
Route: ${ticket.departure} to ${ticket.destination}
Travel Date: ${new Date(ticket.travelDate).toLocaleDateString()}
Departure Time: ${ticket.Bus ? new Date(ticket.Bus.departureTime).toLocaleTimeString() : 'N/A'}
Seat Number: ${ticket.seatNumber}
Bus Fleet: ${ticket.Bus ? ticket.Bus.fleetNumber : 'N/A'}
Amount: $${ticket.amount}
Status: CONFIRMED

IMPORTANT INFORMATION:
- Arrive 30 minutes before departure
- Bring valid ID matching passenger name
- Present this ticket at boarding
- Seat allocation is final

Thank you for choosing ZUPCO Bus Services!
For inquiries: support@zupco.co.zw
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Ticket email sent successfully to:', email);
      return result;
    } catch (error) {
      console.error('❌ Error sending ticket email:', error);
      throw error;
    }
  },

  // Send payment confirmation email
  async sendPaymentConfirmation(email, payment, ticket) {
    const mailOptions = {
      from: `"ZUPCO Bus Services" <${process.env.EMAIL_USER || 'no-reply@curlben.com'}>`,
      to: email,
      subject: `Payment Confirmed - Ticket ${ticket.ticketNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Payment Confirmed</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Your payment was successful</p>
              </div>
            </div>
            
            <!-- Payment Details -->
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #065f46; margin-top: 0;">Payment Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 40%;"><strong>Payment Reference:</strong></td>
                  <td style="padding: 8px 0; color: #065f46; font-weight: bold;">${payment.paymentReference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 8px 0; color: #065f46; font-weight: bold; font-size: 18px;">$${payment.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
                  <td style="padding: 8px 0; color: #065f46; text-transform: capitalize;">${payment.paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Ticket Number:</strong></td>
                  <td style="padding: 8px 0; color: #065f46; font-weight: bold;">${ticket.ticketNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0;">
                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                      PAID
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Date Paid:</strong></td>
                  <td style="padding: 8px 0; color: #065f46;">${new Date(payment.updatedAt).toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <!-- Next Steps -->
            <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 8px;">
              <h4 style="color: #1e40af; margin-top: 0;">🎫 What's Next?</h4>
              <p style="color: #1e40af; margin: 0;">
                Your ticket has been confirmed! You will receive your boarding ticket separately. 
                Please check your email for the ticket confirmation.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0;">Thank you for your payment</p>
              <p style="margin: 5px 0;"><strong>ZUPCO Bus Services</strong></p>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Payment confirmation email sent to:', email);
      return result;
    } catch (error) {
      console.error('❌ Error sending payment confirmation email:', error);
      throw error;
    }
  },

  // Send OTP email (if needed for future features)
  async sendOTPEmail(email, otp) {
    const mailOptions = {
      from: `"ZUPCO Bus Services" <${process.env.EMAIL_USER || 'no-reply@curlben.com'}>`,
      to: email,
      subject: "Your OTP Code - ZUPCO",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">ZUPCO</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">Your Verification Code</h2>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #0ea5e9; letter-spacing: 8px;">
                ${otp}
              </div>
            </div>
            <p style="color: #666;">This OTP will expire in 5 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          </div>
        </div>
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent to:', email);
      return result;
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      throw error;
    }
  },

  // Generic email sender
  async sendEmail({ to, subject, html, text }) {
    const mailOptions = {
      from: `"ZUPCO Bus Services" <${process.env.EMAIL_USER || 'no-reply@curlben.com'}>`,
      to,
      subject,
      html,
      text
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent to:', to);
      return result;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  },

  async sendWelcomeEmail(email, userData) {
    const mailOptions = {
      from: `"ZUPCO Bus Services" <${process.env.EMAIL_USER || 'no-reply@curlben.com'}>`,
      to: email,
      subject: `Welcome to ZUPCO Bus Services, ${userData.firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #0ea5e9; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Welcome to ZUPCO!</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Your account has been created successfully</p>
              </div>
            </div>
            
            <!-- Welcome Message -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2c3e50; margin-bottom: 10px;">Hello, ${userData.firstName} ${userData.lastName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thank you for creating an account with ZUPCO Bus Services. 
                You're now ready to book bus tickets and enjoy convenient travel across Zimbabwe.
              </p>
            </div>

            <!-- Features -->
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0369a1; margin-top: 0;">🎉 What You Can Do Now:</h3>
              <ul style="color: #0369a1; padding-left: 20px;">
                <li>Book bus tickets to various destinations</li>
                <li>Select your preferred seats</li>
                <li>Pay securely with EcoCash and other methods</li>
                <li>View your booking history</li>
                <li>Receive instant email confirmations</li>
              </ul>
            </div>

            <!-- Getting Started -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin-top: 0;">🚀 Getting Started</h3>
              <ol style="color: #2c3e50; padding-left: 20px;">
                <li>Log in to your account</li>
                <li>Browse available bus routes and schedules</li>
                <li>Select your preferred bus and seat</li>
                <li>Complete your booking with secure payment</li>
                <li>Receive your e-ticket via email</li>
              </ol>
            </div>

            <!-- Support Info -->
            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin-top: 0;">📞 Need Help?</h4>
              <p style="color: #92400e; margin: 0;">
                Our customer support team is here to assist you with any questions 
                about your account or bookings.
              </p>
              <p style="color: #92400e; margin: 10px 0 0 0;">
                <strong>Email:</strong> support@zupco.co.zw<br>
                <strong>Phone:</strong> +263 242 123 456
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="margin: 0;">Happy travels with <strong>ZUPCO Bus Services</strong>!</p>
              <p style="margin: 5px 0; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ZUPCO. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
WELCOME TO ZUPCO BUS SERVICES

Hello ${userData.firstName} ${userData.lastName}!

Thank you for creating an account with ZUPCO Bus Services. 
You're now ready to book bus tickets and enjoy convenient travel across Zimbabwe.

WHAT YOU CAN DO NOW:
• Book bus tickets to various destinations
• Select your preferred seats
• Pay securely with EcoCash and other methods
• View your booking history
• Receive instant email confirmations

GETTING STARTED:
1. Log in to your account
2. Browse available bus routes and schedules
3. Select your preferred bus and seat
4. Complete your booking with secure payment
5. Receive your e-ticket via email

NEED HELP?
Our customer support team is here to assist you with any questions about your account or bookings.

Email: support@zupco.co.zw
Phone: +263 242 123 456

Happy travels with ZUPCO Bus Services!

© ${new Date().getFullYear()} ZUPCO. All rights reserved.
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to:', email);
      return result;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw error;
    }
  },

};

module.exports = EmailService;