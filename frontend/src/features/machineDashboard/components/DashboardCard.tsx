import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, change, changeType }) => {
  const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-semibold text-gray-800 mt-2">{value}</p>
      {change && (
        <p className={`text-sm mt-2 ${changeColor}`}>
          {change} vs last shift
        </p>
      )}
    </div>
  );
};

export default DashboardCard;