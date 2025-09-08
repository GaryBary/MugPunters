import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ReportHistory from '../components/ReportHistory';
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'create'>('history');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Reports</h1>
          <p className="text-gray-600">Manage your investment research reports and track performance</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Report
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            Report History
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PlusIcon className="h-5 w-5 inline mr-2" />
            Create New Report
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'history' ? (
          <ReportHistory userId={user.id} />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Report</h3>
              <p className="text-gray-600 mb-6">
                Create a new investment analysis report to track performance over time.
              </p>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Coming Soon</h4>
                  <p className="text-blue-700 text-sm">
                    The report creation interface will be implemented here. 
                    For now, you can view the report history with sample data.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Report History →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
