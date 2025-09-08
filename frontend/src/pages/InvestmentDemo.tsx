import React, { useState } from 'react';
import DashboardComponent from '../components/Dashboard';
import AnalysisResults from '../components/AnalysisResults';
import StockChart from '../components/StockChart';
import { BarChart3, Table, TrendingUp } from 'lucide-react';

const InvestmentDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'chart'>('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Investment Dashboard', icon: BarChart3 },
    { id: 'analysis', name: 'Analysis Results', icon: Table },
    { id: 'chart', name: 'Stock Charts', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'dashboard' && <DashboardComponent />}
        {activeTab === 'analysis' && <AnalysisResults />}
        {activeTab === 'chart' && <StockChart />}
      </div>
    </div>
  );
};

export default InvestmentDemo;
