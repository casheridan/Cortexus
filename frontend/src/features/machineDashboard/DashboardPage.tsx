import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import DashboardCard from './components/DashboardCard';
import { BoltIcon, CubeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <DashboardCard title="OEE" value="85%" change="2%" changeType="increase" icon={BoltIcon} />
            <DashboardCard title="Units Produced" value="10,482" change="150" changeType="increase" icon={CubeIcon} />
            <DashboardCard title="Downtime" value="27 mins" change="5 mins" changeType="decrease" icon={ClockIcon} />
            <DashboardCard title="First Pass Yield" value="99.2%" change="0.1%" changeType="decrease" icon={CheckCircleIcon} />
          </div>

          <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-96">
            <h2 className="text-xl font-bold text-gray-800">Production History</h2>
            {/* Chart component would go here */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;