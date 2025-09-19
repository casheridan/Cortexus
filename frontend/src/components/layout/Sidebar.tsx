import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChartPieIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WrenchIcon,
  ComputerDesktopIcon,
  Squares2X2Icon,
  UserIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { PermissionGuard } from '../auth/PermissionGuard';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const allLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: ChartPieIcon,
      requiredRoles: [], // Available to all authenticated users
    },
    {
      to: '/production-monitor',
      label: 'Production Monitor',
      icon: ComputerDesktopIcon,
      requiredRoles: ['super_admin', 'admin', 'supervisor', 'operator'],
    },
    {
      to: '/boards',
      label: 'Board Tracking',
      icon: Squares2X2Icon,
      requiredRoles: [], // Available to all authenticated users (shared data)
    },
    {
      to: '/line-config',
      label: 'Line Configuration',
      icon: WrenchIcon,
      requiredRoles: ['super_admin', 'admin'],
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      requiredRoles: [], // Available to all authenticated users
    },
  ];

  // Filter links based on user role
  const links = allLinks.filter(link => {
    if (link.requiredRoles.length === 0) return true;
    return profile && link.requiredRoles.includes(profile.role);
  });

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
          {/* Admin-only links */}
          <PermissionGuard requiredRoles={['super_admin', 'admin']}>
            <li className="mt-6 pt-6 border-t border-gray-700">
              <Link
                to="/admin/users"
                className={`flex items-center p-3 text-base font-normal rounded-lg transition-colors duration-200 ${
                  location.pathname === '/admin/users'
                    ? 'bg-gray-700 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
                title="User Management"
              >
                <UserIcon className="w-6 h-6 text-gray-400" />
                <span className="ml-3">User Management</span>
              </Link>
            </li>
          </PermissionGuard>

          {/* Analytics route not implemented, so keep as disabled */}
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

      {/* User Info Footer */}
      {profile && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                profile.role === 'super_admin' ? 'bg-purple-600' :
                profile.role === 'admin' ? 'bg-red-600' :
                profile.role === 'supervisor' ? 'bg-blue-600' :
                profile.role === 'operator' ? 'bg-green-600' :
                profile.role === 'technician' ? 'bg-yellow-600' :
                profile.role === 'quality' ? 'bg-indigo-600' :
                'bg-gray-600'
              }`}>
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile.full_name || profile.username}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {profile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
