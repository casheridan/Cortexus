import React, { useEffect, useState } from 'react';
import DashboardPage from './features/machineDashboard/DashboardPage';
import LineConfigurationPage from './features/lineConfiguration/LineConfigurationPage';

type View = 'dashboard' | 'line-config' | 'analytics' | 'settings';

function resolveHash(): View {
  const h = (window.location.hash || '').replace('#', '').toLowerCase();
  if (h === 'line-config') return 'line-config';
  if (h === 'analytics') return 'analytics';
  if (h === 'settings') return 'settings';
  return 'dashboard';
}

const App: React.FC = () => {
  const [view, setView] = useState<View>(resolveHash());

  useEffect(() => {
    const onHashChange = () => setView(resolveHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (view === 'line-config') return <LineConfigurationPage />;
  // Stubs for now — can add real pages later:
  if (view === 'analytics') return <DashboardPage />; // placeholder
  if (view === 'settings') return <DashboardPage />;  // placeholder

  return <DashboardPage />;
};

export default App;
