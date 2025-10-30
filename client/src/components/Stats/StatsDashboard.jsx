import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../Layout/LoadingSpinner';
import Header from '../Layout/Header';

const StatsDashboard = () => {
  const { state } = useApp();
  const [stats, setStats] = useState({
    busSales: [],
    dailySummary: null,
    occupancyRates: [],
    loading: false,
    error: null
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = localStorage.getItem('token');
      
      const [busSalesRes, dailySummaryRes, occupancyRatesRes] = await Promise.all([
        fetch(`http://localhost:3000/api/reports/bus-sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`http://localhost:3000/api/reports/daily-summary?date=${dateRange.startDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:3000/api/reports/occupancy-rates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!busSalesRes.ok || !dailySummaryRes.ok || !occupancyRatesRes.ok) {
        throw new Error('Failed to fetch stats');
      }

      const [busSales, dailySummary, occupancyRates] = await Promise.all([
        busSalesRes.json(),
        dailySummaryRes.json(),
        occupancyRatesRes.json()
      ]);

      setStats({
        busSales,
        dailySummary,
        occupancyRates,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load statistics'
      }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (stats.loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Business Analytics</h2>
              <p className="text-gray-600">Track your bus service performance and revenue</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Refresh
              </button>
            </div>
          </div>

          {stats.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {stats.error}
            </div>
          )}

          {/* Daily Summary Cards */}
          {stats.dailySummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tickets Sold Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.dailySummary.totalTickets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.dailySummary.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Profit Today</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.dailySummary.totalProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bus Sales Report */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bus Sales Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus Fleet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.busSales.map((sale) => (
                    <tr key={sale.busId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.fleetNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.route}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.ticketsSold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${sale.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        ${sale.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {stats.busSales.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No sales data available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Occupancy Rates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bus Occupancy Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.occupancyRates.map((bus) => (
                <div key={bus.busId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{bus.fleetNumber}</h4>
                      <p className="text-sm text-gray-600">{bus.route}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      bus.occupancyRate >= 80 ? 'bg-green-100 text-green-800' :
                      bus.occupancyRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bus.occupancyRate}% Full
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{bus.totalSeats} seats</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Occupied:</span>
                      <span className="font-medium">{bus.occupiedSeats} seats</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{bus.availableSeats} seats</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          bus.occupancyRate >= 80 ? 'bg-green-600' :
                          bus.occupancyRate >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(bus.occupancyRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {stats.occupancyRates.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No occupancy data available
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tickets Sold:</span>
                  <span className="font-semibold">
                    {stats.busSales.reduce((sum, sale) => sum + sale.ticketsSold, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-semibold text-green-600">
                    ${stats.busSales.reduce((sum, sale) => sum + sale.totalRevenue, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Profit:</span>
                  <span className="font-semibold text-green-600">
                    ${stats.busSales.reduce((sum, sale) => sum + sale.profit, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Occupancy:</span>
                  <span className="font-semibold">
                    {stats.occupancyRates.length > 0 
                      ? Math.round(stats.occupancyRates.reduce((sum, bus) => sum + bus.occupancyRate, 0) / stats.occupancyRates.length)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Performing Bus */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Bus</h3>
              {stats.busSales.length > 0 ? (
                (() => {
                  const topBus = stats.busSales.reduce((top, current) => 
                    current.totalRevenue > top.totalRevenue ? current : top, stats.busSales[0]
                  );
                  
                  return (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-primary-600 font-bold text-lg">🏆</span>
                      </div>
                      <h4 className="font-bold text-lg text-gray-800">{topBus.fleetNumber}</h4>
                      <p className="text-gray-600 mb-2">{topBus.route}</p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-semibold">{topBus.ticketsSold}</span> tickets sold
                        </p>
                        <p className="text-sm text-green-600 font-semibold">
                          ${topBus.totalRevenue.toFixed(2)} revenue
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No performance data available
                </div>
              )}
            </div>
          </div>

          {/* Back to Dashboard Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;