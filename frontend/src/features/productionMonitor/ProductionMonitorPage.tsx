import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import LineSelector from '../lineConfiguration/components/LineSelector';
import { 
  ClockIcon, 
  CogIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import {
  fetchProductionData,
  fetchMachineData,
  refreshProductionData,
  setTimeFilter,
  clearError,
  clearMachineData
} from './state/productionDataSlice';

// Selectors
const selectMachineStates = createSelector(
  [(state: RootState) => state.machineStates.statesByLine, (state: RootState) => state.lineConfig.activeLineId],
  (statesByLine, activeLineId) => activeLineId ? statesByLine[activeLineId] : {}
);

const selectActiveLine = createSelector(
  [(state: RootState) => state.lineConfig.lines, (state: RootState) => state.lineConfig.activeLineId],
  (lines, activeLineId) => lines.find(line => line.id === activeLineId)
);

const ProductionMonitorPage: React.FC = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const {
    timeFilters,
    selectedTimeFilter,
    lineData,
    machineData,
    loading,
    error,
    lastUpdated
  } = useSelector((state: RootState) => state.productionData);
  
  const machineStates = useSelector(selectMachineStates);
  const activeLine = useSelector(selectActiveLine);
  
  // Local state
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load production data on component mount and when time filter changes (but only if we don't have data already)
  useEffect(() => {
    if (!lineData) {
      dispatch(fetchProductionData(selectedTimeFilter) as any);
    }
  }, [dispatch, selectedTimeFilter, lineData]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const handleTimeFilterChange = (filterId: string) => {
    dispatch(setTimeFilter(filterId));
  };

  const handleMachineClick = (machineName: string) => {
    setSelectedMachine(machineName);
    setSidebarOpen(true);
    
    // Fetch machine data if not already loaded
    if (!machineData[machineName] && activeLine) {
      const machine = activeLine.machines.find(m => m.name === machineName);
      if (machine) {
        dispatch(fetchMachineData({ machineName, machineType: machine.type }) as any);
      }
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedMachine(null);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const selectedMachineData = selectedMachine ? machineData[selectedMachine] : null;

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
              <h3 className="text-sm font-medium text-red-800">Error loading production data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => dispatch(fetchProductionData(selectedTimeFilter) as any)}
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
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-96' : ''}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Monitor</h1>
              <p className="text-gray-600 mt-1">Detailed line and machine performance insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <LineSelector />
              <div className="flex items-center space-x-2">
                {timeFilters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => handleTimeFilterChange(filter.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      selectedTimeFilter === filter.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!activeLine ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Please select a line to view production details</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Line Overview Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Line Overview - {activeLine.name}</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Units Produced */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Squares2X2Icon className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Units Produced</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{lineData?.unitsProduced.currentShift || 0}</p>
                    <p className="text-sm text-green-700">Current Shift</p>
                    <p className="text-xs text-green-600">Today: {lineData?.unitsProduced.today || 0} | Total: {lineData?.unitsProduced.total || 0}</p>
                  </div>

                  {/* Line Status */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Line Performance</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">92.3%</p>
                    <p className="text-sm text-purple-700">Overall Efficiency</p>
                    <div className="flex items-center mt-2">
                      <PlayIcon className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">Running</span>
                    </div>
                  </div>
                </div>

                {/* Recent Units */}
                {lineData && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Units Produced</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {lineData.unitsProduced.recentUnits.map(unit => (
                          <div key={unit.id} className="bg-white rounded-md p-3 border border-gray-200">
                            <p className="font-medium text-sm text-gray-900">{unit.id}</p>
                            <p className="text-xs text-blue-600">Board: {unit.boardId}</p>
                            <p className="text-xs text-gray-500">{formatTime(unit.timestamp)}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                              unit.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {unit.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Previous Boards */}
                {lineData && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Previous Boards</h4>
                    <div className="space-y-2">
                      {lineData.previousBoards.map((board, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                          <div>
                            <span className="font-medium text-gray-900">{board.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {board.serialNumber}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              Completed: {formatTime(board.completedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Machines Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Machine Status</h2>
                
                {!activeLine?.machines || activeLine.machines.length === 0 ? (
                  <div className="text-center py-12">
                    <ComputerDesktopIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No machines configured for this line</p>
                    <p className="text-sm text-gray-400">Configure machines in Line Configuration to see them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeLine.machines.map((machine) => {
                      const machineState = machineStates?.[machine.name] || { 
                        name: machine.name, 
                        status: 'Unknown' as const, 
                        efficiency: 0 
                      };
                      
                      const currentMachineData = machineData[machine.name];
                      const hasAlerts = currentMachineData?.alerts?.length > 0;
                      const criticalAlerts = currentMachineData?.alerts?.filter(alert => alert.type === 'error').length || 0;
                      
                      return (
                        <div
                          key={machine.id}
                          onClick={() => handleMachineClick(machine.name)}
                          className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                        >
                          {/* Machine Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <ComputerDesktopIcon className="w-5 h-5 text-gray-600" />
                              <div>
                                <h3 className="font-semibold text-gray-900 truncate">{machine.name}</h3>
                                <p className="text-xs text-gray-500">{machine.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {hasAlerts && (
                                <div className="relative">
                                  <ExclamationTriangleIcon className={`w-5 h-5 ${criticalAlerts > 0 ? 'text-red-500' : 'text-amber-500'}`} />
                                  {(currentMachineData?.alerts?.length || 0) > 1 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                      {currentMachineData?.alerts?.length}
                                    </span>
                                  )}
                                </div>
                              )}
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                machineState.status === 'Running' ? 'bg-green-100 text-green-800' :
                                machineState.status === 'Idle' ? 'bg-yellow-100 text-yellow-800' :
                                machineState.status === 'Engineering' ? 'bg-blue-100 text-blue-800' :
                                machineState.status === 'Down' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {machineState.status}
                              </span>
                            </div>
                          </div>

                          {/* Current Recipe */}
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <CogIcon className="w-4 h-4 text-blue-600 mr-1" />
                              <span className="text-sm font-medium text-gray-700">Current Recipe</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {currentMachineData?.currentRecipe?.name || `${machine.type}_Recipe_V1.0`}
                            </p>
                            <p className="text-xs text-gray-500">
                              v{currentMachineData?.currentRecipe?.version || '1.0.0'}
                            </p>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">OEE</p>
                              <p className={`text-lg font-bold ${
                                (currentMachineData?.efficiency?.oee || 85) >= 85 ? 'text-green-600' :
                                (currentMachineData?.efficiency?.oee || 85) >= 70 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {currentMachineData?.efficiency?.oee || 85}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Cycle Time</p>
                              <p className={`text-lg font-bold ${
                                (currentMachineData?.cycleTimes?.current || 45) <= (currentMachineData?.cycleTimes?.target || 42) ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {currentMachineData?.cycleTimes?.current || 45}s
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Downtime Today</p>
                              <p className={`text-sm font-semibold ${
                                (currentMachineData?.downtime?.today || 15) <= 30 ? 'text-green-600' :
                                (currentMachineData?.downtime?.today || 15) <= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {formatDuration(currentMachineData?.downtime?.today || 15)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Alerts</p>
                              <p className={`text-sm font-semibold ${
                                (currentMachineData?.alerts?.length || 0) === 0 ? 'text-green-600' :
                                criticalAlerts > 0 ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {(currentMachineData?.alerts?.length || 0) === 0 ? 'None' : `${currentMachineData?.alerts?.length} Active`}
                              </p>
                            </div>
                          </div>

                          {/* Click indicator */}
                          <div className="mt-4 text-center">
                            <span className="text-xs text-blue-600 font-medium">Click for details →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Machine Details Sidebar */}
      {sidebarOpen && selectedMachine && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedMachine}</h2>
              <button
                onClick={closeSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            {selectedMachineData ? (
              <div className="space-y-6">
                {/* Alerts */}
                {selectedMachineData.alerts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Alerts</h3>
                    <div className="space-y-2">
                      {selectedMachineData.alerts.map((alert) => (
                        <div key={alert.id} className={`p-3 rounded-lg border ${
                          alert.type === 'error' ? 'bg-red-50 border-red-200' :
                          alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start">
                            <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${
                              alert.type === 'error' ? 'text-red-500' :
                              alert.type === 'warning' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`} />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Recipe */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Recipe</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{selectedMachineData.currentRecipe.name}</p>
                    <p className="text-sm text-gray-600">Version: {selectedMachineData.currentRecipe.version}</p>
                    <p className="text-sm text-gray-600">Started: {new Date(selectedMachineData.currentRecipe.startTime).toLocaleString()}</p>
                  </div>
                </div>

                {/* Cycle Times */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cycle Times</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{selectedMachineData.cycleTimes.current}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-medium">{selectedMachineData.cycleTimes.average}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">{selectedMachineData.cycleTimes.target}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend:</span>
                      <span className={`font-medium ${
                        selectedMachineData.cycleTimes.trend === 'up' ? 'text-red-600' :
                        selectedMachineData.cycleTimes.trend === 'down' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {selectedMachineData.cycleTimes.trend}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Efficiency Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">OEE:</span>
                      <span className="font-medium">{selectedMachineData.efficiency.oee}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability:</span>
                      <span className="font-medium">{selectedMachineData.efficiency.availability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Performance:</span>
                      <span className="font-medium">{selectedMachineData.efficiency.performance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality:</span>
                      <span className="font-medium">{selectedMachineData.efficiency.quality}%</span>
                    </div>
                  </div>
                </div>

                {/* Downtime */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Downtime</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Today:</span>
                      <span className="font-medium">{formatDuration(selectedMachineData.downtime.today)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week:</span>
                      <span className="font-medium">{formatDuration(selectedMachineData.downtime.thisWeek)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Incident:</span>
                      <span className="font-medium text-sm">{new Date(selectedMachineData.downtime.lastIncident).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionMonitorPage;