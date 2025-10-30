import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const BookingForm = ({ bus, onCancel, onSuccess }) => {
  const [seatNumber, setSeatNumber] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const { actions, state } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    
    try {
      const ticketData = {
        busId: bus.id,
        passengerName: `${state.user.firstName} ${state.user.lastName}`,
        passengerEmail: state.user.email,
        passengerPhone: state.user.phone,
        seatNumber: parseInt(seatNumber),
        userId: state.user.id,
      };

      const result = await actions.createTicket(ticketData);
      
      // Initiate payment
      const paymentData = {
        ticketId: result.ticket.id,
        paymentMethod: 'ecocash',
        phoneNumber: state.user.phone,
      };

      const paymentResult = await actions.initiatePayment(paymentData);
      onSuccess(result.ticket, paymentResult);
    } catch (error) {
      // Error handled in context
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Your Seat</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg">{bus.route}</h3>
        <p className="text-gray-600">Fleet: {bus.fleetNumber}</p>
        <p className="text-gray-600">Price: ${bus.price}</p>
        <p className="text-gray-600">
          Departure: {new Date(bus.departureTime).toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seat Number (1-{bus.totalSeats})
          </label>
          <input
            type="number"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            min="1"
            max={bus.totalSeats}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter seat number"
          />
          <p className="text-sm text-gray-500 mt-1">
            Available seats: {bus.availableSeats}
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={localLoading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={localLoading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {localLoading ? 'Booking...' : 'Book & Pay'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;