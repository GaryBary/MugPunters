import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  FileText,
  Briefcase,
  Star,
  Settings,
  LogOut,
  BarChart3,
  X,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Investment Demo', href: '/demo', icon: BarChart3 },
    { name: 'Stocks', href: '/stocks', icon: TrendingUp },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', href: '/watchlist', icon: Star },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="w-64 bg-gray-800 shadow-lg border-r border-gray-700 min-h-screen">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gradient">Mug Punters</h1>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-3 border-t border-gray-700">
        <div className="space-y-1">
          <Link
            to="/settings"
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            Settings
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              window.location.href = '/login';
            }}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
