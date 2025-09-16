import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import DashboardCard from './components/DashboardCard';
import { BoltIcon, CubeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard 
                title="OEE" 
                value="85%" 
                change="2%" 
                changeType="increase" 
                icon={BoltIcon} 
              />
              <DashboardCard 
                title="Units Produced" 
                value="10,482" 
                change="150" 
                changeType="increase" 
                icon={CubeIcon} 
              />
              <DashboardCard 
                title="Downtime" 
                value="27 mins" 
                change="5 mins" 
                changeType="decrease" 
                icon={ClockIcon} 
              />
              <DashboardCard 
                title="First Pass Yield" 
                value="99.2%" 
                change="0.1%" 
                changeType="decrease" 
                icon={CheckCircleIcon} 
              />
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
                  {[
                    { name: 'Pick & Place 1', status: 'Running', efficiency: 98 },
                    { name: 'Pick & Place 2', status: 'Running', efficiency: 95 },
                    { name: 'Reflow Oven', status: 'Idle', efficiency: 0 },
                    { name: 'AOI Station', status: 'Running', efficiency: 92 },
                  ].map((machine) => (
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
                {[
                  { time: '2 mins ago', message: 'Pick & Place 2 efficiency below threshold', type: 'warning' },
                  { time: '15 mins ago', message: 'Reflow Oven temperature stabilized', type: 'info' },
                  { time: '1 hour ago', message: 'Shift change completed successfully', type: 'success' },
                ].map((alert, index) => (
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
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;