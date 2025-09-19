import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../../store';
import { fetchCfxData, clearProcessedData } from './state/cfxDataSlice';
import { clearAllEvents } from './state/eventsSlice';
import { clearAllAlerts } from './state/alertsSlice';
import { fetchDashboardData, refreshDashboardData, clearError } from './state/dashboardDataSlice';
import DashboardCard from './components/DashboardCard';
import LiveEventFeed from './components/LiveEventFeed';
import { BoltIcon, CubeIcon, ClockIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import LineSelector from '../lineConfiguration/components/LineSelector';

// Memoized selectors to prevent unnecessary re-renders
const selectMachineStates = createSelector(
  [(state: RootState) => state.machineStates.statesByLine, (state: RootState) => state.lineConfig.activeLineId],
  (statesByLine, activeLineId) => activeLineId ? statesByLine[activeLineId] : {}
);

const selectEvents = createSelector(
  [(state: RootState) => state.events.eventsByLine, (state: RootState) => state.lineConfig.activeLineId],
  (eventsByLine, activeLineId) => activeLineId ? eventsByLine[activeLineId] || [] : []
);

const selectAlerts = createSelector(
  [(state: RootState) => state.alerts.alertsByLine, (state: RootState) => state.lineConfig.activeLineId],
  (alertsByLine, activeLineId) => activeLineId ? alertsByLine[activeLineId] || [] : []
);

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.cfxData);
  const { kpiData, machineStatuses, alerts: dashboardAlerts, loading, error } = useSelector((state: RootState) => state.dashboardData);
  
  const machineStates = useSelector(selectMachineStates);
  const events = useSelector(selectEvents);
  const alerts = useSelector(selectAlerts);

  // Load dashboard data on component mount (but only if we don't have data already)
  useEffect(() => {
    if (kpiData.length === 0) {
      dispatch(fetchDashboardData() as any);
    }
  }, [dispatch, kpiData.length]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const handleReload = () => {
    // Clear processed data and fetch fresh CFX data
    dispatch(clearAllEvents());
    dispatch(clearAllAlerts());
    dispatch(clearProcessedData());
    dispatch(fetchCfxData());
    // Also refresh dashboard data
    dispatch(refreshDashboardData() as any);
  };

  // Only show loading state for initial load if no data exists
  if (loading && kpiData.length === 0 && !error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => dispatch(fetchDashboardData() as any)}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleReload}
            disabled={status === 'loading' || loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${(status === 'loading' || loading) ? 'animate-spin' : ''}`} />
            <span>{(status === 'loading' || loading) ? 'Loading...' : 'Reload Data'}</span>
          </button>
          <LineSelector />
        </div>
      </div>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => (
          <DashboardCard 
            key={index}
            title={kpi.title} 
            value={kpi.value} 
            change={kpi.change} 
            changeType={kpi.changeType} 
            icon={kpi.title === "OEE" ? BoltIcon : kpi.title === "Units Produced" ? CubeIcon : kpi.title === "Downtime" ? ClockIcon : CheckCircleIcon} 
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production History Chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Production History</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">24H</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md">7D</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md">30D</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be integrated here</p>
          </div>
        </div>

        {/* Machine Status */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Machine Status</h2>
          <div className="space-y-4">
            {machineStates && Object.values(machineStates).map(machine => (
              <div key={machine.name} className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{machine.name}</span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  machine.status === 'Running' ? 'bg-green-100 text-green-800' :
                  machine.status === 'Idle' ? 'bg-yellow-100 text-yellow-800' :
                  machine.status === 'Engineering' ? 'bg-blue-100 text-blue-800' :
                  machine.status === 'Down' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {machine.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts and Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg flex items-start space-x-3 ${
                alert.type === 'error' ? 'bg-red-50' : 'bg-yellow-50'
              }`}>
                <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full ${
                  alert.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                  }`}>{alert.message}</p>
                  <p className={`text-xs ${
                    alert.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`}>{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Feed */}
        <LiveEventFeed events={events} />
      </div>
    </div>
  );
};

export default DashboardPage;