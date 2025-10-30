import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const Header = () => {
  const { state, actions } = useApp();
  const location = useLocation();

  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to={state.user ? "/dashboard" : "/"} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">Z</span>
              </div>
              <h1 className="text-2xl font-bold">ZUPCO</h1>
              <p className="text-primary-100">Bus Ticket Booking</p>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.user ? (
              <>
                {/* Navigation Links */}
                <nav className="flex items-center space-x-4 mr-4">
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md transition-colors ${
                      location.pathname === '/dashboard' 
                        ? 'bg-primary-700 text-white' 
                        : 'text-primary-100 hover:bg-primary-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/reports" 
                    className={`px-3 py-2 rounded-md transition-colors ${
                      location.pathname === '/reports' 
                        ? 'bg-primary-700 text-white' 
                        : 'text-primary-100 hover:bg-primary-700'
                    }`}
                  >
                    Analytics
                  </Link>
                </nav>

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
              <div className="flex space-x-2">
                <Link 
                  to="/login" 
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-transparent border border-white text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;