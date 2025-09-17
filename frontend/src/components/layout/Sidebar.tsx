import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChartPieIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WrenchIcon,
  ComputerDesktopIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: ChartPieIcon,
    },
    {
      to: '/production-monitor',
      label: 'Production Monitor',
      icon: ComputerDesktopIcon,
    },
    {
      to: '/boards',
      label: 'Board Tracking',
      icon: Squares2X2Icon,
    },
    {
      to: '/line-config',
      label: 'Line Configuration',
      icon: WrenchIcon,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-wider">CORTEXUS</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul>
          {links.map((link, idx) => {
            const isActive = location.pathname === link.to || (link.to === '/dashboard' && location.pathname === '/');
            return (
              <li key={link.to} className={idx !== 0 ? 'mt-4' : ''}>
                <Link
                  to={link.to}
                  className={`flex items-center p-3 text-base font-normal rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                  title={link.label}
                >
                  <link.icon className="w-6 h-6 text-gray-400" />
                  <span className="ml-3">{link.label}</span>
                </Link>
              </li>
            );
          })}
          {/* Analytics route not implemented, so keep as disabled or remove */}
          <li className="mt-4">
            <span
              className="flex items-center p-3 text-base font-normal rounded-lg bg-gray-800 text-gray-500 cursor-not-allowed"
              title="Analytics (coming soon)"
            >
              <ChartBarIcon className="w-6 h-6 text-gray-400" />
              <span className="ml-3">Analytics</span>
            </span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
