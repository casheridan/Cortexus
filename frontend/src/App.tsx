import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLineConfigs } from './features/lineConfiguration/state/lineConfigSlice';
import { initializeMachineStates, updateMachineStatus } from './features/machineDashboard/state/machineStatesSlice';
import type { MachineStatus } from './features/machineDashboard/state/machineStatesSlice';
import { fetchCfxData, clearProcessedData } from './features/machineDashboard/state/cfxDataSlice';
import { clearAllEvents, addEvent } from './features/machineDashboard/state/eventsSlice';
import { clearAllAlerts, addAlert } from './features/machineDashboard/state/alertsSlice';
import type { AppDispatch, RootState } from './store';
import type { UUID } from './features/lineConfiguration/types';
import { useAuth } from './contexts/SupabaseAuthContext';

import DashboardPage from './features/machineDashboard/DashboardPage';
import LineConfigurationPage from './features/lineConfiguration/LineConfigurationPage';
import ProductionMonitorPage from './features/productionMonitor/ProductionMonitorPage';
import BoardsPage from './features/boards/BoardsPage';
import SettingsPage from './pages/SettingsPage';
import SimpleLoginPage from './components/auth/SimpleLoginPage';
import UserProfile from './components/auth/UserProfile';
import MainLayout from './components/layout/MainLayout';
import { ProductionAccess, ConfigurationAccess, AdminOnly } from './components/auth/PermissionGuard';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile, loading } = useAuth();
  const { lines, activeLineId } = useSelector((state: RootState) => state.lineConfig);
  const { data: cfxData, status } = useSelector((state: RootState) => state.cfxData);

  const machineToLineMap = useMemo(() => {
    const map: Record<string, UUID> = {};
    lines.forEach(line => {
      line.machines.forEach(machine => {
        map[machine.name] = line.id;
      });
    });
    return map;
  }, [lines]);

  useEffect(() => {
    dispatch(fetchLineConfigs());
    // Clear any existing processed data and fetch fresh CFX data on app initialization
    dispatch(clearAllEvents());
    dispatch(clearAllAlerts());
    dispatch(clearProcessedData());
    dispatch(fetchCfxData());
  }, [dispatch]);

  useEffect(() => {
    const activeLine = lines.find(line => line.id === activeLineId);
    if (activeLine && activeLine.machines && activeLineId) {
      const machineNames = activeLine.machines.map(m => m.name);
      dispatch(initializeMachineStates({ lineId: activeLineId, machineNames }));
      
      // Reapply machine statuses from already processed CFX data
      if (status === 'succeeded' && cfxData.length > 0) {
        cfxData.forEach(msg => {
          if (msg.MessageName === 'CFX.ResourcePerformance.StationStateChanged') {
            const machineName = msg.Source;
            const lineId = machineToLineMap[machineName];
            
            if (lineId === activeLineId) {
              const state = msg.MessageBody.NewState;
              let newStatus: MachineStatus = 'Unknown';

              // Mapping based on SEMI E58 state codes
              const stateCode = parseInt(state);
              if (stateCode >= 1000 && stateCode <= 1999) {
                newStatus = 'Running';
              } else if (stateCode === 2100) {
                newStatus = 'Idle';
              } else if (stateCode >= 3000 && stateCode <= 3999) {
                newStatus = 'Engineering';
              } else if (stateCode >= 4100 && stateCode <= 4900) {
                newStatus = 'Down';
              } else if (stateCode === 5000) {
                newStatus = 'Down';
              } else {
                newStatus = 'Unknown';
              }
              
              dispatch(updateMachineStatus({ lineId, machineName, status: newStatus }));
            }
          }
        });
      }
    }
  }, [lines, activeLineId, dispatch, cfxData, status, machineToLineMap]);

  // Process CFX data when it's available
  useEffect(() => {
    if (status === 'succeeded' && cfxData.length > 0) {
      const processedIds = new Set<string>();

      cfxData.forEach(msg => {
        if (processedIds.has(msg.UniqueID)) return;
        processedIds.add(msg.UniqueID);

        const machineName = msg.Source;
        const lineId = machineToLineMap[machineName];

        if (!lineId) return;

        // Add to event feed
        dispatch(addEvent({ lineId, event: msg }));

        // Update machine status
        if (msg.MessageName === 'CFX.ResourcePerformance.StationStateChanged') {
          const state = msg.MessageBody.NewState;
          let newStatus: MachineStatus = 'Unknown';

          // Mapping based on SEMI E58 state codes
          const stateCode = parseInt(state);
          if (stateCode >= 1000 && stateCode <= 1999) {
            // Productive Time (1000-1999)
            newStatus = 'Running';
          } else if (stateCode === 2100) {
            // Standby Time (2100)
            newStatus = 'Idle';
          } else if (stateCode >= 3000 && stateCode <= 3999) {
            // Engineering Time (3000-3999)
            newStatus = 'Engineering';
          } else if (stateCode >= 4100 && stateCode <= 4900) {
            // Scheduled Downtime (4100-4900)
            newStatus = 'Down';
          } else if (stateCode === 5000) {
            // Unscheduled Downtime (5000)
            newStatus = 'Down';
          } else {
            newStatus = 'Unknown';
          }
          
          dispatch(updateMachineStatus({ lineId, machineName, status: newStatus }));
        }

        // Add alerts for faults
        if (msg.MessageName === 'CFX.ResourcePerformance.FaultOccurred') {
          dispatch(addAlert({
            lineId,
            alert: {
              id: msg.UniqueID,
              type: 'error',
              message: `Fault on ${msg.Source}: ${msg.MessageBody.Fault.FaultCode}`,
              time: new Date(msg.TimeStamp).toLocaleString(),
            }
          }));
        }
      });
    }
  }, [cfxData, status, dispatch, machineToLineMap]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login page if not authenticated or no profile
  if (!user || !profile) {
    return <SimpleLoginPage />
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Dashboard - accessible to all authenticated users */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Production Monitor - requires production access */}
        <Route 
          path="/production-monitor" 
          element={
            <ProductionAccess fallback={
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                <p className="text-gray-600">You don't have permission to view production data.</p>
              </div>
            }>
              <ProductionMonitorPage />
            </ProductionAccess>
          } 
        />
        
        {/* Boards - accessible to all authenticated users (shared data) */}
        <Route path="/boards" element={<BoardsPage />} />
        
        {/* Line Configuration - admin only */}
        <Route 
          path="/line-config" 
          element={
            <ConfigurationAccess fallback={
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
                <p className="text-gray-600">Only administrators can modify line configurations.</p>
              </div>
            }>
              <LineConfigurationPage />
            </ConfigurationAccess>
          } 
        />
        
        {/* Settings - includes user profile */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>
      
      {/* Redirect unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;