import React from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="bg-white h-20 flex items-center justify-between px-8 border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">SMT Line Overview</h1>
        <p className="text-sm text-gray-500">Real-time production monitoring</p>
      </div>
      <div className="flex items-center space-x-6">
        <BellIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
        <div className="flex items-center space-x-3">
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
            <div>
                <p className="font-semibold text-sm text-gray-800">Christian S.</p>
                <p className="text-xs text-gray-500">Administrator</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;