import React from 'react';
import {
  ChartPieIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-wider">CORTEXUS</h1>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul>
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-base font-normal bg-gray-700 text-white rounded-lg"
              title="Dashboard"
            >
              <ChartPieIcon className="w-6 h-6 text-gray-400" />
              <span className="ml-3">Dashboard</span>
            </a>
          </li>

          <li className="mt-4">
            <a
              href="#analytics"
              className="flex items-center p-3 text-base font-normal rounded-lg hover:bg-gray-700 transition-colors duration-200"
              title="Analytics"
            >
              <ChartBarIcon className="w-6 h-6 text-gray-400" />
              <span className="ml-3">Analytics</span>
            </a>
          </li>

          <li className="mt-4">
            <a
              href="#line-config"
              className="flex items-center p-3 text-base font-normal rounded-lg hover:bg-gray-700 transition-colors duration-200"
              title="Line Configuration"
            >
              <WrenchIcon className="w-6 h-6 text-gray-400" />
              <span className="ml-3">Line Configuration</span>
            </a>
          </li>

          <li className="mt-4">
            <a
              href="#settings"
              className="flex items-center p-3 text-base font-normal rounded-lg hover:bg-gray-700 transition-colors duration-200"
              title="Settings"
            >
              <Cog6ToothIcon className="w-6 h-6 text-gray-400" />
              <span className="ml-3">Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
