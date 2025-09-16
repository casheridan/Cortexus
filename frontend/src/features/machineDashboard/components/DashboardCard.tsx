import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string; titleId?: string } & React.RefAttributes<SVGSVGElement>>;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';
  const changeIcon = changeType === 'increase' ? '↗' : '↘';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center space-x-1">
            <span className={`text-sm font-medium ${changeColor}`}>
              {changeIcon} {change}
            </span>
            <span className="text-xs text-gray-500">vs last shift</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;