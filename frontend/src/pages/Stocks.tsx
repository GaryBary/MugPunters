import React from 'react';

const Stocks: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stocks</h1>
        <p className="text-gray-600">Browse and analyze ASX stocks</p>
      </div>
      <div className="card">
        <p className="text-center text-gray-600">
          Stock listing and analysis will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default Stocks;
