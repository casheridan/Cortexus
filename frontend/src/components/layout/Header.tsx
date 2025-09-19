import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const Header: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'text-purple-600';
      case 'admin':
        return 'text-red-600';
      case 'supervisor':
        return 'text-blue-600';
      case 'operator':
        return 'text-green-600';
      case 'technician':
        return 'text-yellow-600';
      case 'quality':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <header className="bg-white h-20 flex items-center justify-between px-8 border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cortexus Manufacturing</h1>
        <p className="text-sm text-gray-500">Real-time production monitoring & control</p>
      </div>
      <div className="flex items-center space-x-6">
        <BellIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-800">
                {profile?.full_name || profile?.username || 'User'}
              </p>
              <p className={`text-xs ${getRoleColor(profile?.role || 'operator')}`}>
                {getRoleDisplayName(profile?.role || 'operator')}
              </p>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm text-gray-500">@{profile?.username}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  profile?.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                  profile?.role === 'admin' ? 'bg-red-100 text-red-800' :
                  profile?.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                  profile?.role === 'operator' ? 'bg-green-100 text-green-800' :
                  profile?.role === 'technician' ? 'bg-yellow-100 text-yellow-800' :
                  profile?.role === 'quality' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getRoleDisplayName(profile?.role || 'operator')}
                </span>
              </div>
              
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                View Profile
              </Link>
              
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                Settings
              </Link>
              
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    setIsSigningOut(true);
                    await signOut();
                    setIsSigningOut(false);
                  }}
                  disabled={isSigningOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;