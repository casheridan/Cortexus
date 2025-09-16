
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardPage from './features/machineDashboard/DashboardPage';
import LineConfigurationPage from './features/lineConfiguration/LineConfigurationPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';

const App: React.FC = () => {
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
