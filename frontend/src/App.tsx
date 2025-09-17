import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLineConfigs } from './features/lineConfiguration/state/lineConfigSlice';
import { initializeMachineStates } from './features/machineDashboard/state/machineStatesSlice';
import { fetchCfxData, clearProcessedData } from './features/machineDashboard/state/cfxDataSlice';
import { clearAllEvents } from './features/machineDashboard/state/eventsSlice';
import { clearAllAlerts } from './features/machineDashboard/state/alertsSlice';
import type { AppDispatch, RootState } from './store';

import DashboardPage from './features/machineDashboard/DashboardPage';
import LineConfigurationPage from './features/lineConfiguration/LineConfigurationPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { lines, activeLineId } = useSelector((state: RootState) => state.lineConfig);

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
    }
  }, [lines, activeLineId, dispatch]);

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