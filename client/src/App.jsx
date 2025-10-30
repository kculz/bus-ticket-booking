import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Layout/Header';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import BusList from './components/Bus/BusList';
import TicketList from './components/Ticket/TicketList';
import BookingForm from './components/Ticket/BookingForm';

function App() {
  const { state } = useApp();
  const [authMode, setAuthMode] = useState('login');
  const [selectedBus, setSelectedBus] = useState(null);
  const [activeTab, setActiveTab] = useState('buses');

  // Show auth forms if user is not logged in
  if (!state.user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {authMode === 'login' ? (
            <LoginForm onToggleMode={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onToggleMode={() => setAuthMode('login')} />
          )}
        </main>
      </div>
    );
  }

  // Show booking form if a bus is selected
  if (selectedBus) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <BookingForm
            bus={selectedBus}
            onCancel={() => setSelectedBus(null)}
            onSuccess={(ticket, payment) => {
              setSelectedBus(null);
              setActiveTab('tickets');
            }}
          />
        </main>
      </div>
    );
  }

  // Main dashboard after login
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('buses')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'buses'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Available Buses
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'tickets'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Tickets
          </button>
        </div>

        {/* Show error message if any */}
        {state.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {state.error}
          </div>
        )}

        {/* Content */}
        {activeTab === 'buses' && (
          <BusList onSelectBus={setSelectedBus} />
        )}
        {activeTab === 'tickets' && <TicketList />}
      </main>
    </div>
  );
}

export default App;