import 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-2xl font-semibold text-gray-800">SMT Line Overview</h1>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Welcome, User</span>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;