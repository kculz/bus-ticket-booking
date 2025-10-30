import React from 'react';
import { useApp } from '../../context/AppContext';

const Header = () => {
  const { state, actions } = useApp();

  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">Z</span>
            </div>
            <h1 className="text-2xl font-bold">ZUPCO</h1>
            <p className="text-primary-100">Bus Ticket Booking</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.user ? (
              <>
                <span className="text-primary-100">
                  Welcome, {state.user.firstName}
                </span>
                <button
                  onClick={actions.logout}
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-primary-100">Please login to book tickets</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;