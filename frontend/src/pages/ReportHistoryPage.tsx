import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ReportHistory from '../components/ReportHistory';
import Layout from '../components/Layout';

const ReportHistoryPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view your report history.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReportHistory userId={user.id} />
      </div>
    </Layout>
  );
};

export default ReportHistoryPage;
