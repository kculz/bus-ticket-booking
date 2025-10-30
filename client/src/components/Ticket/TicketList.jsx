import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../Layout/LoadingSpinner';
import PaymentModal from '../Payment/PaymentModal';

const TicketList = () => {
  const { state, actions } = useApp();
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadTickets = async () => {
      if (state.user) {
        setLocalLoading(true);
        try {
          await actions.fetchTickets(state.user.id);
        } catch (error) {
          // Error handled in context
        } finally {
          setLocalLoading(false);
        }
      }
    };

    loadTickets();
  }, [state.user]);

  const handlePayment = (ticket) => {
    setSelectedTicket(ticket);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (ticket, paymentResult) => {
    setShowPaymentModal(false);
    setSelectedTicket(null);
    
    // Refresh tickets list
    actions.fetchTickets(state.user.id);
    
    alert('Payment successful! Your ticket has been confirmed. Check your email for details.');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Payment' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Payment Failed' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (localLoading) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h2>
        
        {state.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {state.error}
          </div>
        )}
        
        {state.tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't booked any tickets yet.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Payments Section */}
            {state.tickets.filter(ticket => ticket.paymentStatus === 'pending').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-3">
                  Pending Payments ({state.tickets.filter(ticket => ticket.paymentStatus === 'pending').length})
                </h3>
                <div className="space-y-3">
                  {state.tickets
                    .filter(ticket => ticket.paymentStatus === 'pending')
                    .map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg shadow-md p-6 border border-yellow-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {ticket.departure} → {ticket.destination}
                          </h3>
                          <p className="text-gray-600">
                            Ticket: {ticket.ticketNumber}
                          </p>
                          <p className="text-gray-600">Seat: {ticket.seatNumber}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(ticket.paymentStatus)}
                          <p className="text-lg font-bold text-primary-600 mt-2">
                            ${ticket.amount}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <div>
                          <strong>Passenger:</strong> {ticket.passengerName}
                        </div>
                        <div>
                          <strong>Date:</strong>{' '}
                          {new Date(ticket.travelDate).toLocaleDateString()}
                        </div>
                      </div>

                      {ticket.Bus && (
                        <div className="mt-2 text-sm text-gray-500 mb-4">
                          Bus: {ticket.Bus.fleetNumber} • {ticket.Bus.busType}
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handlePayment(ticket)}
                          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Tickets Section */}
            {state.tickets.filter(ticket => ticket.paymentStatus === 'completed').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-3">
                  Confirmed Tickets ({state.tickets.filter(ticket => ticket.paymentStatus === 'completed').length})
                </h3>
                <div className="space-y-3">
                  {state.tickets
                    .filter(ticket => ticket.paymentStatus === 'completed')
                    .map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg shadow-md p-6 border border-green-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {ticket.departure} → {ticket.destination}
                          </h3>
                          <p className="text-gray-600">
                            Ticket: {ticket.ticketNumber}
                          </p>
                          <p className="text-gray-600">Seat: {ticket.seatNumber}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(ticket.paymentStatus)}
                          <p className="text-lg font-bold text-primary-600 mt-2">
                            ${ticket.amount}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div>
                          <strong>Passenger:</strong> {ticket.passengerName}
                        </div>
                        <div>
                          <strong>Date:</strong>{' '}
                          {new Date(ticket.travelDate).toLocaleDateString()}
                        </div>
                      </div>

                      {ticket.Bus && (
                        <div className="mt-2 text-sm text-gray-500">
                          Bus: {ticket.Bus.fleetNumber} • {ticket.Bus.busType}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Payments Section */}
            {state.tickets.filter(ticket => ticket.paymentStatus === 'failed').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3">
                  Failed Payments ({state.tickets.filter(ticket => ticket.paymentStatus === 'failed').length})
                </h3>
                <div className="space-y-3">
                  {state.tickets
                    .filter(ticket => ticket.paymentStatus === 'failed')
                    .map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg shadow-md p-6 border border-red-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {ticket.departure} → {ticket.destination}
                          </h3>
                          <p className="text-gray-600">
                            Ticket: {ticket.ticketNumber}
                          </p>
                          <p className="text-gray-600">Seat: {ticket.seatNumber}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(ticket.paymentStatus)}
                          <p className="text-lg font-bold text-primary-600 mt-2">
                            ${ticket.amount}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handlePayment(ticket)}
                          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                        >
                          Retry Payment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        ticket={selectedTicket}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default TicketList;