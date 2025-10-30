import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Header from './components/Layout/Header';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import BusList from './components/Bus/BusList';
import TicketList from './components/Ticket/TicketList';
import BookingForm from './components/Ticket/BookingForm';
import LoadingSpinner from './components/Layout/LoadingSpinner';
import StatsDashboard from './components/Stats/StatsDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { state } = useApp();
  return state.user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { state } = useApp();
  return !state.user ? children : <Navigate to="/dashboard" />;
};

// Main Dashboard Component
const Dashboard = () => {
  const { state } = useApp();
  const [selectedBus, setSelectedBus] = useState(null);
  const [activeTab, setActiveTab] = useState('buses');

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
          <button
            onClick={() => window.location.href = '/reports'}
            className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700 ml-auto"
          >
            View Analytics →
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
};

// Auth Component
const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login');

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
};

function App() {
  const { state } = useApp();

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <StatsDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to={state.user ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to={state.user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;