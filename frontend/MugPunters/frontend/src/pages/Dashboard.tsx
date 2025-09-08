import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: 'Total Reports',
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      icon: FileText,
    },
    {
      title: 'Portfolio Value',
      value: '$125,430',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Watchlists',
      value: '5',
      change: '+2',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Total Gain/Loss',
      value: '+$12,450',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Mug Punters Investment Research Platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.changeType === 'positive' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ASX 200 Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Value</span>
              <span className="text-2xl font-bold text-gray-900">7,234.56</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Change</span>
              <span className="text-green-600 font-semibold">+45.23 (+0.63%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volume</span>
              <span className="text-gray-900">2.4B</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Movers</h2>
          <div className="space-y-3">
            {[
              { symbol: 'BHP', name: 'BHP Group', change: '+3.2%', price: '$45.67' },
              { symbol: 'CBA', name: 'Commonwealth Bank', change: '+2.8%', price: '$98.45' },
              { symbol: 'CSL', name: 'CSL Limited', change: '+2.1%', price: '$234.56' },
            ].map((stock, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-600">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{stock.price}</p>
                  <p className="text-sm text-green-600">{stock.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
        <div className="space-y-4">
          {[
            {
              title: 'BHP Group - Strong Q3 Results',
              symbol: 'BHP',
              recommendation: 'BUY',
              target: '$48.00',
              date: '2024-01-15',
            },
            {
              title: 'Commonwealth Bank - Dividend Analysis',
              symbol: 'CBA',
              recommendation: 'HOLD',
              target: '$95.00',
              date: '2024-01-12',
            },
            {
              title: 'CSL Limited - Growth Prospects',
              symbol: 'CSL',
              recommendation: 'BUY',
              target: '$250.00',
              date: '2024-01-10',
            },
          ].map((report, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-600">{report.symbol} • {report.date}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  report.recommendation === 'BUY' ? 'bg-green-100 text-green-800' :
                  report.recommendation === 'HOLD' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.recommendation}
                </span>
                <p className="text-sm text-gray-600 mt-1">Target: {report.target}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
