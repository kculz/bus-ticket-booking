import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

const initialState = {
  user: null,
  buses: [],
  tickets: [],
  payments: [],
  loading: false,
  error: null,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_BUSES':
      return { ...state, buses: action.payload, loading: false };
    case 'SET_TICKETS':
      return { ...state, tickets: action.payload, loading: false };
    case 'ADD_TICKET':
      return { 
        ...state, 
        tickets: [...state.tickets, action.payload],
        loading: false 
      };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.id ? action.payload : ticket
        ),
        loading: false
      };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check for stored token on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(user) });
    }
  }, []);

  // Action creators with proper error handling and loading state management
  const actions = {
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),

    login: async (email, password) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch({ type: 'SET_USER', payload: response.data.user });
        dispatch({ type: 'SET_LOADING', payload: false });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.error || 'Login failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    register: async (userData) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.post('/auth/register', userData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch({ type: 'SET_USER', payload: response.data.user });
        dispatch({ type: 'SET_LOADING', payload: false });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.error || 'Registration failed';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    },

    fetchBuses: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.get('/buses');
        dispatch({ type: 'SET_BUSES', payload: response.data });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to fetch buses';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    fetchTickets: async (userId) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.get(`/tickets/user/${userId}`);
        dispatch({ type: 'SET_TICKETS', payload: response.data });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to fetch tickets';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    createTicket: async (ticketData) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.post('/tickets', ticketData);
        dispatch({ type: 'ADD_TICKET', payload: response.data.ticket });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to create ticket';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },

    initiatePayment: async (paymentData) => {
        try {
            const response = await api.post('/payments/initiate', paymentData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.error || 'Payment initiation failed';
            dispatch({ type: 'SET_ERROR', payload: message });
            throw error;
        }
    },

    checkPaymentStatus: async (reference) => {
        try {
            const response = await api.get(`/payments/${reference}/status`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to check payment status';
            dispatch({ type: 'SET_ERROR', payload: message });
            throw error;
        }
    },

      fetchBusSales: async (startDate, endDate) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get(`/reports/bus-sales?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch bus sales';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  },

  fetchDailySummary: async (date) => {
    try {
      const response = await api.get(`/reports/daily-summary?date=${date}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch daily summary';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  },

  fetchOccupancyRates: async () => {
    try {
      const response = await api.get('/reports/occupancy-rates');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch occupancy rates';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};