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

import DashboardPage from './features/machineDashboard/DashboardPage';
import LineConfigurationPage from './features/lineConfiguration/LineConfigurationPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/line-config" element={<LineConfigurationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      {/* Redirect unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;