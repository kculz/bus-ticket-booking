import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const PaymentModal = ({ ticket, isOpen, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('ecocash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, polling, success, failed
  const [statusMessage, setStatusMessage] = useState('');
  const { actions, state } = useApp();

  useEffect(() => {
    if (ticket && state.user) {
      setPhoneNumber(state.user.phone);
    }
  }, [ticket, state.user]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setStatusMessage('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setStatusMessage('Initiating payment...');

    try {
    const paymentData = {
    ticketId: ticket.id,
    paymentMethod: paymentMethod,
    phoneNumber: phoneNumber,
    userId: state.user.id // Make sure this is included
    };

    const result = await actions.initiatePayment(paymentData);
      
      if (result.success) {
        setPaymentStatus('polling');
        setStatusMessage('Payment initiated. Checking status...');
        
        // Start polling for payment status
        pollPaymentStatus(result.reference);
      } else {
        setPaymentStatus('failed');
        setStatusMessage(result.error || 'Payment initiation failed');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
      setStatusMessage('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (reference) => {
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts * 3 seconds = 1 minute timeout
    
    const poll = async () => {
      attempts++;
      try {
        setStatusMessage(`Checking payment status... (${attempts}/${maxAttempts})`);
        
        const statusResult = await actions.checkPaymentStatus(reference);
        
        console.log('Payment status check:', statusResult);
        
        if (statusResult.status === 'completed' && statusResult.success) {
          setPaymentStatus('success');
          setStatusMessage('Payment successful! Your ticket is confirmed.');
          setIsProcessing(false);
          
          // Wait a moment then close and refresh
          setTimeout(() => {
            onSuccess(ticket, statusResult);
          }, 2000);
          return;
          
        } else if (statusResult.status === 'failed' || statusResult.status === 'cancelled') {
          setPaymentStatus('failed');
          setStatusMessage(`Payment ${statusResult.status}: ${statusResult.message}`);
          setIsProcessing(false);
          return;
          
        } else if (statusResult.status === 'paid') {
          // Sometimes Paynow returns 'paid' instead of 'completed'
          setPaymentStatus('success');
          setStatusMessage('Payment successful! Your ticket is confirmed.');
          setIsProcessing(false);
          
          setTimeout(() => {
            onSuccess(ticket, statusResult);
          }, 2000);
          return;
        }
        
        // Continue polling if still pending
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Poll every 3 seconds
        } else {
          setPaymentStatus('failed');
          setStatusMessage('Payment timeout. Please check your mobile money and try again.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setPaymentStatus('failed');
          setStatusMessage('Unable to verify payment status. Please check your mobile money.');
          setIsProcessing(false);
        }
      }
    };
    
    poll();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
      case 'polling':
        return (
          <div className="animate-pulse flex space-x-2 justify-center items-center">
            <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
      case 'polling':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {paymentStatus === 'idle' ? 'Complete Payment' : 'Payment Status'}
            </h2>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            )}
          </div>

          {/* Status Display */}
          {(paymentStatus === 'processing' || paymentStatus === 'polling' || paymentStatus === 'success' || paymentStatus === 'failed') && (
            <div className={`mb-6 p-4 rounded-lg border ${getStatusColor()} text-center`}>
              {getStatusIcon()}
              <p className="mt-3 font-semibold">{statusMessage}</p>
              
              {(paymentStatus === 'processing' || paymentStatus === 'polling') && (
                <p className="text-sm mt-2 opacity-75">
                  Please check your phone for a payment prompt and enter your PIN.
                </p>
              )}
              
              {paymentStatus === 'success' && (
                <p className="text-sm mt-2">
                  You will receive your ticket confirmation via email shortly.
                </p>
              )}
              
              {paymentStatus === 'failed' && (
                <button
                  onClick={() => setPaymentStatus('idle')}
                  className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Ticket Summary - Show only when not in success/failed state */}
          {(paymentStatus === 'idle' || paymentStatus === 'processing') && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-2">Ticket Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{ticket.departure} → {ticket.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passenger:</span>
                  <span className="font-medium">{ticket.passengerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat:</span>
                  <span className="font-medium">{ticket.seatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Travel Date:</span>
                  <span className="font-medium">
                    {new Date(ticket.travelDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-primary-600">${ticket.amount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form - Show only when idle */}
          {paymentStatus === 'idle' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ecocash"
                      checked={paymentMethod === 'ecocash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-bold">E</span>
                      </div>
                      <span>EcoCash</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="onemoney"
                      checked={paymentMethod === 'onemoney'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-bold">O</span>
                      </div>
                      <span>OneMoney</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+263 XXX XXX XXX"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You will receive a payment prompt on this number
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Payment Instructions:</h4>
                <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                  <li>Click "Proceed to Pay" below</li>
                  <li>Check your phone for a payment prompt</li>
                  <li>Enter your mobile money PIN to complete payment</li>
                  <li>Wait for confirmation (this may take a few seconds)</li>
                </ol>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 font-semibold"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Pay'}
                </button>
              </div>
            </form>
          )}

          {/* Close button for success state */}
          {paymentStatus === 'success' && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onClose}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;