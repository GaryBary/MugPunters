import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Disclaimer from './components/Disclaimer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import Reports from './pages/Reports';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Register from './pages/Register';
import StockDetail from './pages/StockDetail';
import ReportDetail from './pages/ReportDetail';
import CreateReport from './pages/CreateReport';
import InvestmentDemo from './pages/InvestmentDemo';

// Create a client with enhanced error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

// Error fallback component for route-level errors
const RouteErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
      <h2 className="text-xl font-semibold text-white mb-4">Page Error</h2>
      <p className="text-gray-300 mb-4">
        This page encountered an error. Please try again or navigate to a different page.
      </p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen disclaimer
    const hasSeenDisclaimer = localStorage.getItem('mugPunters_disclaimer_seen');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading Mug Punters..." />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App min-h-screen bg-gray-900">
            <ErrorBoundary fallback={<RouteErrorFallback error={new Error('Route error')} resetError={() => window.location.reload()} />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  <ErrorBoundary>
                    <Login />
                  </ErrorBoundary>
                } />
                <Route path="/register" element={
                  <ErrorBoundary>
                    <Register />
                  </ErrorBoundary>
                } />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  } />
                  <Route path="stocks" element={
                    <ErrorBoundary>
                      <Stocks />
                    </ErrorBoundary>
                  } />
                  <Route path="stocks/:symbol" element={
                    <ErrorBoundary>
                      <StockDetail />
                    </ErrorBoundary>
                  } />
                  <Route path="reports" element={
                    <ErrorBoundary>
                      <Reports />
                    </ErrorBoundary>
                  } />
                  <Route path="reports/new" element={
                    <ErrorBoundary>
                      <CreateReport />
                    </ErrorBoundary>
                  } />
                  <Route path="reports/:id" element={
                    <ErrorBoundary>
                      <ReportDetail />
                    </ErrorBoundary>
                  } />
                  <Route path="portfolio" element={
                    <ErrorBoundary>
                      <Portfolio />
                    </ErrorBoundary>
                  } />
                  <Route path="watchlist" element={
                    <ErrorBoundary>
                      <Watchlist />
                    </ErrorBoundary>
                  } />
                  <Route path="demo" element={
                    <ErrorBoundary>
                      <InvestmentDemo />
                    </ErrorBoundary>
                  } />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
            
            {/* Disclaimer Modal */}
            <Disclaimer 
              variant="modal" 
              showModal={showDisclaimer} 
              onClose={() => setShowDisclaimer(false)} 
            />
            
            {/* Footer Disclaimer */}
            <Disclaimer variant="footer" />
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
