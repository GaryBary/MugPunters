import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Mug Punters Investment Research Platform
        </h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Mug Punters</h2>
          <p className="text-gray-300 mb-4">
            Your professional investment research platform for ASX analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-600 p-4 rounded">
              <h3 className="font-semibold">Market Analysis</h3>
              <p className="text-sm text-blue-200">Real-time ASX data</p>
            </div>
            <div className="bg-green-600 p-4 rounded">
              <h3 className="font-semibold">Investment Reports</h3>
              <p className="text-sm text-green-200">Professional research</p>
            </div>
            <div className="bg-purple-600 p-4 rounded">
              <h3 className="font-semibold">Portfolio Tracking</h3>
              <p className="text-sm text-purple-200">Monitor your investments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
