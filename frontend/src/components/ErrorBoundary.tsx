import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You could send this to a logging service like Sentry
      console.error('Production error:', { error: error.message, stack: error.stack, errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                We're sorry, but something unexpected happened. This error has been logged and we'll look into it.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-700 p-3 rounded text-xs">
                  <p className="text-red-400 font-mono mb-2">Error: {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="text-gray-400 whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>If this problem persists, please contact support.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
