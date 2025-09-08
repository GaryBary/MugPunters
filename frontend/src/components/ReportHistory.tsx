import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ChartBarIcon, 
  ClockIcon, 
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { reportApi } from '../services/reportApi';
import { AnalysisReport, ReEvaluationResponse } from '../types';

// Types are now imported from types/index.ts

interface ReportHistoryProps {
  userId: string;
}

const ReportHistory: React.FC<ReportHistoryProps> = ({ userId }) => {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    timeframe: 'all',
    dateRange: 'all'
  });
  const [reEvaluating, setReEvaluating] = useState<Set<string>>(new Set());

  // Mock data for demonstration
  const mockReports: AnalysisReport[] = [
    {
      id: '1',
      user_id: userId,
      stock_symbol: 'CBA',
      risk_level: 'moderate',
      timeframe: '1y',
      parameters: {
        technical_indicators: ['RSI', 'MACD', 'SMA'],
        fundamental_metrics: ['PE', 'PB', 'ROE'],
        risk_factors: ['volatility', 'beta', 'sector']
      },
      results: {
        technical_score: 75,
        fundamental_score: 82,
        risk_score: 68,
        overall_score: 75,
        recommendation: 'buy',
        confidence: 0.78,
        target_price: 95.50,
        key_metrics: {
          pe_ratio: 15.2,
          pb_ratio: 1.8,
          dividend_yield: 4.2
        }
      },
      created_at: '2024-01-15T10:30:00Z',
      last_updated: '2024-01-15T10:30:00Z',
      performance: {
        report_id: '1',
        stock_symbol: 'CBA',
        original_price: 88.50,
        current_price: 92.30,
        performance_pct: 4.29,
        predicted_return: 7.9,
        actual_return: 4.29,
        accuracy_score: 0.54,
        last_updated: '2024-01-20T15:45:00Z'
      }
    },
    {
      id: '2',
      user_id: userId,
      stock_symbol: 'BHP',
      risk_level: 'aggressive',
      timeframe: '6m',
      parameters: {
        technical_indicators: ['RSI', 'Bollinger', 'Volume'],
        fundamental_metrics: ['PE', 'Debt/Equity', 'ROA'],
        risk_factors: ['commodity', 'currency', 'global']
      },
      results: {
        technical_score: 68,
        fundamental_score: 71,
        risk_score: 45,
        overall_score: 61,
        recommendation: 'hold',
        confidence: 0.65,
        target_price: 42.80,
        key_metrics: {
          pe_ratio: 8.5,
          debt_to_equity: 0.35,
          roa: 12.1
        }
      },
      created_at: '2024-01-10T14:20:00Z',
      last_updated: '2024-01-10T14:20:00Z',
      performance: {
        report_id: '2',
        stock_symbol: 'BHP',
        original_price: 41.20,
        current_price: 39.80,
        performance_pct: -3.40,
        predicted_return: 3.9,
        actual_return: -3.40,
        accuracy_score: 0.13,
        last_updated: '2024-01-20T15:45:00Z'
      }
    },
    {
      id: '3',
      user_id: userId,
      stock_symbol: 'WBC',
      risk_level: 'conservative',
      timeframe: '2y',
      parameters: {
        technical_indicators: ['SMA', 'EMA', 'MACD'],
        fundamental_metrics: ['PE', 'Dividend Yield', 'Book Value'],
        risk_factors: ['interest_rate', 'credit', 'regulatory']
      },
      results: {
        technical_score: 72,
        fundamental_score: 85,
        risk_score: 78,
        overall_score: 78,
        recommendation: 'buy',
        confidence: 0.82,
        target_price: 28.50,
        key_metrics: {
          pe_ratio: 12.8,
          dividend_yield: 5.1,
          book_value: 22.40
        }
      },
      created_at: '2024-01-05T09:15:00Z',
      last_updated: '2024-01-05T09:15:00Z',
      performance: {
        report_id: '3',
        stock_symbol: 'WBC',
        original_price: 25.80,
        current_price: 27.20,
        performance_pct: 5.43,
        predicted_return: 10.5,
        actual_return: 5.43,
        accuracy_score: 0.52,
        last_updated: '2024-01-20T15:45:00Z'
      }
    }
  ];

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await reportApi.getReports({
          risk_level: filters.riskLevel !== 'all' ? filters.riskLevel as any : undefined,
          timeframe: filters.timeframe !== 'all' ? filters.timeframe : undefined,
        });
        setReports(response.reports);
      } catch (err) {
        console.error('Failed to load reports:', err);
        setError('Failed to load report history');
        // Fallback to mock data for demonstration
        setReports(mockReports);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId, filters.riskLevel, filters.timeframe]);

  const handleReEvaluate = async (reportId: string) => {
    setReEvaluating(prev => new Set(prev).add(reportId));
    try {
      const reEvaluationResult = await reportApi.reEvaluateReport(reportId);
      
      // Update the report with new performance data
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? {
              ...report,
              performance: {
                report_id: reEvaluationResult.report_id,
                stock_symbol: reEvaluationResult.stock_symbol,
                original_price: reEvaluationResult.original_price,
                current_price: reEvaluationResult.current_price,
                performance_pct: reEvaluationResult.performance_pct,
                predicted_return: reEvaluationResult.predicted_return,
                actual_return: reEvaluationResult.actual_return,
                accuracy_score: reEvaluationResult.accuracy_score,
                days_since_analysis: reEvaluationResult.days_since_analysis,
                last_updated: reEvaluationResult.re_evaluation_date
              }
            }
          : report
      ));
    } catch (err) {
      console.error('Failed to re-evaluate report:', err);
      setError('Failed to re-evaluate report');
    } finally {
      setReEvaluating(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const filteredReports = reports.filter(report => {
    if (filters.riskLevel !== 'all' && report.risk_level !== filters.riskLevel) {
      return false;
    }
    if (filters.timeframe !== 'all' && report.timeframe !== filters.timeframe) {
      return false;
    }
    return true;
  });

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy':
      case 'buy':
        return 'text-green-600 bg-green-100';
      case 'hold':
        return 'text-yellow-600 bg-yellow-100';
      case 'sell':
      case 'strong_sell':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 0) return 'text-green-600';
    if (performance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.7) return 'text-green-600';
    if (accuracy >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report History</h2>
          <p className="text-gray-600">Track and compare your analysis performance over time</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredReports.length} of {reports.length} reports
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-4">
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
            
            <select
              value={filters.timeframe}
              onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Timeframes</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{report.stock_symbol}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(report.results.recommendation)}`}>
                    {report.results.recommendation.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {report.risk_level.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(report.created_at)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {report.timeframe} timeframe
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Overall Score: </span>
                      <span className="font-medium">{report.results.overall_score}/100</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Confidence: </span>
                      <span className="font-medium">{(report.results.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Target Price: </span>
                      <span className="font-medium">${report.results.target_price.toFixed(2)}</span>
                    </div>
                    {report.performance && (
                      <div className="text-sm">
                        <span className="text-gray-600">Current Price: </span>
                        <span className="font-medium">${report.performance.current_price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Tracking */}
                {report.performance && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Tracking</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {report.performance.performance_pct > 0 ? '+' : ''}{report.performance.performance_pct.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-600">Actual Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {report.performance.predicted_return > 0 ? '+' : ''}{report.performance.predicted_return.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Predicted Return</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getAccuracyColor(report.performance.accuracy_score)}`}>
                          {(report.performance.accuracy_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Accuracy Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          ${report.performance.original_price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">Original Price</div>
                      </div>
                    </div>
                    
                    {/* Performance Indicator */}
                    <div className="mt-3 flex items-center justify-center">
                      {report.performance.accuracy_score >= 0.7 ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">High Accuracy</span>
                        </div>
                      ) : report.performance.accuracy_score >= 0.5 ? (
                        <div className="flex items-center text-yellow-600">
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Moderate Accuracy</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircleIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Low Accuracy</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {Object.entries(report.results.key_metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="font-medium text-gray-900">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </div>
                      <div className="text-gray-600 capitalize">
                        {key.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                <button
                  onClick={() => handleReEvaluate(report.id)}
                  disabled={reEvaluating.has(report.id)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reEvaluating.has(report.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Re-evaluating...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Re-evaluate
                    </>
                  )}
                </button>
                
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {reports.length === 0 
              ? "You haven't created any analysis reports yet."
              : "Try adjusting your filters to see more reports."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportHistory;
