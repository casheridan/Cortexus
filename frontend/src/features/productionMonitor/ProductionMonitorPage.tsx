import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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

// Time filter options
const TIME_FILTERS = [
  { id: '1h', label: '1 Hour', value: 1 },
  { id: '4h', label: '4 Hours', value: 4 },
  { id: '8h', label: '8 Hours', value: 8 },
  { id: '24h', label: '24 Hours', value: 24 },
  { id: '7d', label: '7 Days', value: 168 },
];

// Mock data for line-level metrics - will be replaced with real data
const mockLineData = {
  previousBoards: [
    { name: "Main Control Board", serialNumber: "MCB-2024-001246", completedAt: "2024-01-15T14:15:30Z" },
    { name: "Power Management Board", serialNumber: "PMB-2024-001247", completedAt: "2024-01-15T13:45:15Z" },
    { name: "Sensor Interface Board", serialNumber: "SIB-2024-001248", completedAt: "2024-01-15T13:20:45Z" },
  ],
  unitsProduced: {
    total: 1247,
    today: 89,
    currentShift: 34,
    recentUnits: [
      { id: "UNIT-2024-001247", boardId: "PCB-A7829", timestamp: "2024-01-15T14:23:15Z", status: "completed" },
      { id: "UNIT-2024-001246", boardId: "PCB-A7828", timestamp: "2024-01-15T14:21:45Z", status: "completed" },
      { id: "UNIT-2024-001245", boardId: "PCB-A7827", timestamp: "2024-01-15T14:20:12Z", status: "completed" },
      { id: "UNIT-2024-001244", boardId: "PCB-A7826", timestamp: "2024-01-15T14:18:33Z", status: "in-progress" },
    ]
  }
};

// Mock detailed machine data - keyed by actual machine names from line config
// This simulates detailed metrics that would come from CFX messages or other data sources
const getMockMachineData = (_machineName: string, machineType: string) => {
  // Generate realistic mock data based on machine type
  const baseData = {
    alerts: [] as Array<{id: string, type: 'error' | 'warning' | 'info', message: string, timestamp: string}>,
    currentRecipe: {
      name: `${machineType}_Recipe_V1.0`,
      version: "1.0.0",
      startTime: "2024-01-15T08:30:00Z"
    },
    cycleTimes: {
      current: 45.0,
      average: 43.0,
      target: 42.0,
      trend: "stable" as const
    },
    downtime: {
      today: 15,
      thisWeek: 120,
      lastIncident: "2024-01-15T10:30:00Z"
    },
    efficiency: {
      oee: 85.0,
      availability: 95.0,
      performance: 90.0,
      quality: 99.5
    }
  };

  // Customize based on machine type
  switch (machineType) {
    case 'Placement':
      return {
        ...baseData,
        alerts: [
          { id: "alert-1", type: "warning" as const, message: "Nozzle pressure low", timestamp: "2024-01-15T14:20:00Z" }
        ],
        currentRecipe: {
          name: "SMT_PickPlace_Recipe_V1.3",
          version: "1.3.2",
          startTime: "2024-01-15T08:30:00Z"
        },
        cycleTimes: { current: 45.2, average: 43.8, target: 42.0, trend: "up" as const },
        efficiency: { oee: 87.5, availability: 94.2, performance: 92.8, quality: 99.9 }
      };
    
    case 'Oven':
      return {
        ...baseData,
        alerts: [
          { id: "alert-2", type: "error" as const, message: "Temperature zone 3 out of range", timestamp: "2024-01-15T14:15:00Z" }
        ],
        currentRecipe: {
          name: "Reflow_Profile_LeadFree_V2.0",
          version: "2.0.1",
          startTime: "2024-01-15T08:35:00Z"
        },
        cycleTimes: { current: 180.5, average: 175.2, target: 170.0, trend: "stable" as const },
        downtime: { today: 45, thisWeek: 234, lastIncident: "2024-01-15T14:15:00Z" },
        efficiency: { oee: 78.3, availability: 89.1, performance: 87.9, quality: 99.9 }
      };
    
    case 'Inspection':
      return {
        ...baseData,
        currentRecipe: {
          name: "AOI_Inspection_Standard_V1.1",
          version: "1.1.0",
          startTime: "2024-01-15T08:32:00Z"
        },
        cycleTimes: { current: 25.8, average: 24.2, target: 22.0, trend: "stable" as const },
        downtime: { today: 5, thisWeek: 67, lastIncident: "2024-01-14T16:20:00Z" },
        efficiency: { oee: 94.1, availability: 98.3, performance: 95.7, quality: 99.9 }
      };
    
    default:
      return baseData;
  }
};

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
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('8h');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const machineStates = useSelector(selectMachineStates);
  const activeLine = useSelector(selectActiveLine);

  const handleMachineClick = (machineName: string) => {
    setSelectedMachine(machineName);
    setSidebarOpen(true);
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
                {TIME_FILTERS.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedTimeFilter(filter.id)}
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
                    <p className="text-2xl font-bold text-green-900">{mockLineData.unitsProduced.currentShift}</p>
                    <p className="text-sm text-green-700">Current Shift</p>
                    <p className="text-xs text-green-600">Today: {mockLineData.unitsProduced.today} | Total: {mockLineData.unitsProduced.total}</p>
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
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Units Produced</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {mockLineData.unitsProduced.recentUnits.map(unit => (
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

            {/* Previous Boards */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Previous Boards</h4>
              <div className="space-y-2">
                {mockLineData.previousBoards.map((board, index) => (
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
                      
                      const machineData = getMockMachineData(machine.name, machine.type);
                      const hasAlerts = machineData.alerts.length > 0;
                      const criticalAlerts = machineData.alerts.filter(alert => alert.type === 'error').length;
                      
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
                                  {machineData.alerts.length > 1 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                      {machineData.alerts.length}
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
                            <p className="text-sm font-semibold text-gray-900 truncate">{machineData.currentRecipe.name}</p>
                            <p className="text-xs text-gray-500">v{machineData.currentRecipe.version}</p>
                          </div>

                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">OEE</p>
                              <p className={`text-lg font-bold ${
                                machineData.efficiency.oee >= 85 ? 'text-green-600' :
                                machineData.efficiency.oee >= 70 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {machineData.efficiency.oee}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Cycle Time</p>
                              <p className={`text-lg font-bold ${
                                machineData.cycleTimes.current <= machineData.cycleTimes.target ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {machineData.cycleTimes.current}s
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Downtime Today</p>
                              <p className={`text-sm font-semibold ${
                                machineData.downtime.today <= 30 ? 'text-green-600' :
                                machineData.downtime.today <= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {formatDuration(machineData.downtime.today)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Alerts</p>
                              <p className={`text-sm font-semibold ${
                                machineData.alerts.length === 0 ? 'text-green-600' :
                                criticalAlerts > 0 ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {machineData.alerts.length === 0 ? 'None' : `${machineData.alerts.length} Active`}
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

              {/* Future Boards Section Placeholder */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Board Tracking</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    Coming Soon
                  </span>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Squares2X2Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Detailed board tracking and analysis will be available here</p>
                  <p className="text-sm mt-1">Link boards to units, track quality metrics, and view board history</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Machine Sidebar */}
      {sidebarOpen && selectedMachine && activeLine && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              {(() => {
                const selectedMachineConfig = activeLine.machines.find(m => m.name === selectedMachine);
                const selectedMachineData = selectedMachineConfig ? getMockMachineData(selectedMachineConfig.name, selectedMachineConfig.type) : null;
                
                if (!selectedMachineConfig || !selectedMachineData) return null;
                
                return (
                  <>
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedMachine}</h2>
                        <p className="text-sm text-gray-500">{selectedMachineConfig.type}</p>
                      </div>
                <button
                  onClick={closeSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Machine Status */}
              <div className="mb-6">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  machineStates?.[selectedMachine]?.status === 'Running' ? 'bg-green-100 text-green-800' :
                  machineStates?.[selectedMachine]?.status === 'Idle' ? 'bg-yellow-100 text-yellow-800' :
                  machineStates?.[selectedMachine]?.status === 'Engineering' ? 'bg-blue-100 text-blue-800' :
                  machineStates?.[selectedMachine]?.status === 'Down' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {machineStates?.[selectedMachine]?.status || 'Unknown'}
                </span>
              </div>

                    {/* Current Recipe */}
                    <div className="mb-6 bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CogIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Current Recipe</h3>
                      </div>
                      <p className="font-bold text-blue-900">{selectedMachineData.currentRecipe.name}</p>
                      <p className="text-sm text-blue-700">Version {selectedMachineData.currentRecipe.version}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Started: {formatTime(selectedMachineData.currentRecipe.startTime)}
                      </p>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="space-y-6">
                      {/* OEE Breakdown */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <ChartBarIcon className="w-5 h-5 text-emerald-600 mr-2" />
                          OEE Breakdown
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Overall OEE</span>
                              <span className="font-semibold">{selectedMachineData.efficiency.oee}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full" 
                                style={{ width: `${selectedMachineData.efficiency.oee}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Availability</span>
                              <span className="font-semibold">{selectedMachineData.efficiency.availability}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${selectedMachineData.efficiency.availability}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Performance</span>
                              <span className="font-semibold">{selectedMachineData.efficiency.performance}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: `${selectedMachineData.efficiency.performance}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Quality</span>
                              <span className="font-semibold">{selectedMachineData.efficiency.quality}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${selectedMachineData.efficiency.quality}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cycle Times */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <ClockIcon className="w-5 h-5 text-blue-600 mr-2" />
                          Cycle Times
                        </h3>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Current</p>
                            <p className="font-bold text-lg">{selectedMachineData.cycleTimes.current}s</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Average</p>
                            <p className="font-bold text-lg">{selectedMachineData.cycleTimes.average}s</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Target</p>
                            <p className="font-bold text-lg">{selectedMachineData.cycleTimes.target}s</p>
                          </div>
                        </div>
                      </div>

                      {/* Downtime */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <PauseIcon className="w-5 h-5 text-red-600 mr-2" />
                          Downtime Analysis
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Today</span>
                            <span className="font-semibold">{formatDuration(selectedMachineData.downtime.today)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">This Week</span>
                            <span className="font-semibold">{formatDuration(selectedMachineData.downtime.thisWeek)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Incident</span>
                            <span className="font-semibold text-sm">{formatTime(selectedMachineData.downtime.lastIncident)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Alerts */}
                      {selectedMachineData.alerts.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
                            Active Alerts ({selectedMachineData.alerts.length})
                          </h3>
                          <div className="space-y-3">
                            {selectedMachineData.alerts.map(alert => (
                              <div
                                key={alert.id}
                                className={`p-3 rounded-lg border ${
                                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                                  alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                                  'bg-blue-50 border-blue-200'
                                }`}
                              >
                                <p className={`text-sm font-medium ${
                                  alert.type === 'error' ? 'text-red-800' :
                                  alert.type === 'warning' ? 'text-amber-800' :
                                  'text-blue-800'
                                }`}>
                                  {alert.message}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  alert.type === 'error' ? 'text-red-600' :
                                  alert.type === 'warning' ? 'text-amber-600' :
                                  'text-blue-600'
                                }`}>
                                  {formatTime(alert.timestamp)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductionMonitorPage;
