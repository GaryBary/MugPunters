import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Logo/Brand - hidden on mobile */}
          <div className="hidden lg:flex items-center">
            <h1 className="text-xl font-bold text-white">Mug Punters</h1>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search stocks, reports..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-100">John Doe</p>
                <p className="text-xs text-gray-400">john@example.com</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
