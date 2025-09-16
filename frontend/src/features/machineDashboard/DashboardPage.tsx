
import React from 'react';
import DashboardCard from './components/DashboardCard';
import { BoltIcon, CubeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { kpiData, machineStatusData, alertsData } from '../../data/machineData';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-8">
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
            {machineStatusData.map((machine) => (
              <div key={machine.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    machine.status === 'Running' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="font-medium text-gray-900">{machine.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    machine.status === 'Running' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {machine.status}
                  </span>
                  <span className="text-sm text-gray-500">{machine.efficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Alerts</h2>
        <div className="space-y-3">
          {alertsData.map((alert, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                alert.type === 'warning' ? 'bg-yellow-400' :
                alert.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;