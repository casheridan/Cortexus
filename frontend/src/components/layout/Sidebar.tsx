import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white flex-shrink-0 p-4">
      <div className="text-2xl font-bold mb-8">Cortexus</div>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="#" className="block p-2 bg-gray-700 rounded">Dashboard</a>
          </li>
          <li className="mb-4">
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">Analytics</a>
          </li>
          <li className="mb-4">
            <a href="#" className="block p-2 hover:bg-gray-700 rounded">Settings</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;