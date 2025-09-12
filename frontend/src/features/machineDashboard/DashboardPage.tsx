import React from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import DashboardCard from './components/DashboardCard';

const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - hidden on small screens */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Overall Equipment Effectiveness (OEE)" value="85%" change="+2%" changeType="increase" />
            <DashboardCard title="Units Produced" value="10,482" change="+150" changeType="increase" />
            <DashboardCard title="Downtime" value="27 mins" change="-5 mins" changeType="decrease" />
            <DashboardCard title="First Pass Yield (FPY)" value="99.2%" change="-0.1%" changeType="decrease" />
          </div>

          <div className="mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md h-96">
                <h2 className="text-xl font-semibold text-gray-700">Production History</h2>
                {/* Chart component would go here */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;