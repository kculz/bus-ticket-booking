import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../Layout/LoadingSpinner';

const BusList = ({ onSelectBus }) => {
  const { state, actions } = useApp();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadBuses = async () => {
      setLocalLoading(true);
      try {
        await actions.fetchBuses();
      } catch (error) {
        // Error handled in context
      } finally {
        setLocalLoading(false);
      }
    };

    loadBuses();
  }, []);

  if (localLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Buses</h2>
      
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {state.error}
        </div>
      )}
      
      {state.buses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No buses available at the moment.
        </div>
      ) : (
        state.buses.map((bus) => (
          <div
            key={bus.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {bus.route}
                </h3>
                <p className="text-gray-600">Fleet: {bus.fleetNumber}</p>
                <p className="text-gray-600">Type: {bus.busType}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  ${bus.price}
                </p>
                <p className="text-sm text-gray-500">
                  {bus.availableSeats} seats available
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <div>
                <strong>Departure:</strong>{' '}
                {new Date(bus.departureTime).toLocaleString()}
              </div>
              <div>
                <strong>Arrival:</strong>{' '}
                {new Date(bus.arrivalTime).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => onSelectBus(bus)}
              disabled={bus.availableSeats === 0}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {bus.availableSeats === 0 ? 'Sold Out' : 'Book Seat'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default BusList;