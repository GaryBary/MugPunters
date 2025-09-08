import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface StockRecommendation {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  technicalScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  potentialReturn: number;
  sector: string;
  marketCap: string;
  pe: number;
  dividend: number;
  volume: string;
  change: number;
  changePercent: number;
  targetPrice: number;
  analystRating: number;
  lastUpdated: string;
}

type SortField = 'technicalScore' | 'potentialReturn' | 'currentPrice' | 'changePercent' | 'analystRating';
type SortDirection = 'asc' | 'desc';

const AnalysisResults: React.FC = () => {
  const [sortField, setSortField] = useState<SortField>('technicalScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  const stockRecommendations: StockRecommendation[] = [
    {
      id: '1',
      symbol: 'BHP',
      name: 'BHP Group Limited',
      currentPrice: 45.67,
      technicalScore: 87,
      riskLevel: 'Medium',
      recommendation: 'Strong Buy',
      potentialReturn: 12.5,
      sector: 'Mining',
      marketCap: '230.5B',
      pe: 8.2,
      dividend: 4.8,
      volume: '15.2M',
      change: 1.42,
      changePercent: 3.2,
      targetPrice: 52.00,
      analystRating: 4.5,
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      symbol: 'CBA',
      name: 'Commonwealth Bank of Australia',
      currentPrice: 98.45,
      technicalScore: 82,
      riskLevel: 'Low',
      recommendation: 'Buy',
      potentialReturn: 8.3,
      sector: 'Finance',
      marketCap: '175.8B',
      pe: 15.6,
      dividend: 3.9,
      volume: '8.7M',
      change: 2.68,
      changePercent: 2.8,
      targetPrice: 108.00,
      analystRating: 4.2,
      lastUpdated: '2024-01-15'
    },
    {
      id: '3',
      symbol: 'CSL',
      name: 'CSL Limited',
      currentPrice: 234.56,
      technicalScore: 79,
      riskLevel: 'Medium',
      recommendation: 'Buy',
      potentialReturn: 15.2,
      sector: 'Healthcare',
      marketCap: '112.3B',
      pe: 28.4,
      dividend: 1.8,
      volume: '2.1M',
      change: 4.82,
      changePercent: 2.1,
      targetPrice: 275.00,
      analystRating: 4.1,
      lastUpdated: '2024-01-15'
    },
    {
      id: '4',
      symbol: 'WBC',
      name: 'Westpac Banking Corporation',
      currentPrice: 22.34,
      technicalScore: 75,
      riskLevel: 'Medium',
      recommendation: 'Hold',
      potentialReturn: 5.8,
      sector: 'Finance',
      marketCap: '78.9B',
      pe: 12.3,
      dividend: 5.2,
      volume: '12.4M',
      change: 0.45,
      changePercent: 2.0,
      targetPrice: 24.50,
      analystRating: 3.8,
      lastUpdated: '2024-01-15'
    },
    {
      id: '5',
      symbol: 'ANZ',
      name: 'ANZ Banking Group Limited',
      currentPrice: 25.67,
      technicalScore: 73,
      riskLevel: 'Medium',
      recommendation: 'Hold',
      potentialReturn: 4.2,
      sector: 'Finance',
      marketCap: '76.2B',
      pe: 11.8,
      dividend: 4.9,
      volume: '9.8M',
      change: 0.48,
      changePercent: 1.9,
      targetPrice: 27.00,
      analystRating: 3.6,
      lastUpdated: '2024-01-15'
    },
    {
      id: '6',
      symbol: 'WOW',
      name: 'Woolworths Group Limited',
      currentPrice: 34.21,
      technicalScore: 68,
      riskLevel: 'Low',
      recommendation: 'Hold',
      potentialReturn: 3.5,
      sector: 'Consumer',
      marketCap: '42.1B',
      pe: 18.7,
      dividend: 2.8,
      volume: '3.2M',
      change: -0.12,
      changePercent: -0.3,
      targetPrice: 36.00,
      analystRating: 3.4,
      lastUpdated: '2024-01-15'
    }
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStocks = useMemo(() => {
    return [...stockRecommendations].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [stockRecommendations, sortField, sortDirection]);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Buy':
        return 'bg-green-600 text-white';
      case 'Buy':
        return 'bg-green-500 text-white';
      case 'Hold':
        return 'bg-yellow-500 text-white';
      case 'Sell':
        return 'bg-red-500 text-white';
      case 'Strong Sell':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-orange-400';
      case 'Very High':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary-400" />
      : <ChevronDown className="h-4 w-4 text-primary-400" />;
  };

  const toggleExpanded = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Investment Analysis Results</h2>
          <p className="text-gray-400">
            AI-powered stock recommendations based on your investment profile
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-green-600 to-green-800 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Strong Buy</p>
                <p className="text-3xl font-bold text-white">2</p>
                <p className="text-green-200 text-sm">Recommendations</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Avg. Return</p>
                <p className="text-3xl font-bold text-white">8.3%</p>
                <p className="text-blue-200 text-sm">Potential</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Avg. Score</p>
                <p className="text-3xl font-bold text-white">77</p>
                <p className="text-purple-200 text-sm">Technical</p>
              </div>
              <Star className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Risk Level</p>
                <p className="text-3xl font-bold text-white">Medium</p>
                <p className="text-orange-200 text-sm">Balanced</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('symbol')}
                  >
                    <div className="flex items-center">
                      Stock
                      {getSortIcon('symbol')}
                    </div>
                  </th>
                  <th className="table-header">Current Price</th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('technicalScore')}
                  >
                    <div className="flex items-center">
                      Technical Score
                      {getSortIcon('technicalScore')}
                    </div>
                  </th>
                  <th className="table-header">Risk Level</th>
                  <th className="table-header">Recommendation</th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('potentialReturn')}
                  >
                    <div className="flex items-center">
                      Potential Return
                      {getSortIcon('potentialReturn')}
                    </div>
                  </th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedStocks.map((stock) => (
                  <React.Fragment key={stock.id}>
                    <tr className="hover:bg-gray-700 transition-colors">
                      <td className="table-cell">
                        <div>
                          <div className="font-bold text-white">{stock.symbol}</div>
                          <div className="text-sm text-gray-400">{stock.name}</div>
                          <div className="text-xs text-gray-500">{stock.sector}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="font-semibold text-white">${stock.currentPrice.toFixed(2)}</div>
                          <div className={`text-sm flex items-center ${
                            stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-600 rounded-full h-2 mr-3">
                            <div 
                              className="bg-primary-500 h-2 rounded-full" 
                              style={{ width: `${stock.technicalScore}%` }}
                            />
                          </div>
                          <span className="font-semibold text-white">{stock.technicalScore}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`font-medium ${getRiskColor(stock.riskLevel)}`}>
                          {stock.riskLevel}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(stock.recommendation)}`}>
                          {stock.recommendation}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="font-semibold text-green-400">
                            +{stock.potentialReturn.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-400">
                            Target: ${stock.targetPrice.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => toggleExpanded(stock.id)}
                          className="btn-primary text-sm py-1 px-3 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {expandedRow === stock.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {expandedRow === stock.id && (
                      <tr className="bg-gray-750">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                              <h4 className="font-semibold text-white mb-3">Financial Metrics</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Market Cap:</span>
                                  <span className="text-white">{stock.marketCap}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">P/E Ratio:</span>
                                  <span className="text-white">{stock.pe}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Dividend:</span>
                                  <span className="text-white">{stock.dividend}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Volume:</span>
                                  <span className="text-white">{stock.volume}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-white mb-3">Analysis</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Analyst Rating:</span>
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span className="text-white">{stock.analystRating}/5</span>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Risk Level:</span>
                                  <span className={`font-medium ${getRiskColor(stock.riskLevel)}`}>
                                    {stock.riskLevel}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Sector:</span>
                                  <span className="text-white">{stock.sector}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Last Updated:</span>
                                  <span className="text-white">{stock.lastUpdated}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-white mb-3">Price Targets</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Current:</span>
                                  <span className="text-white">${stock.currentPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Target:</span>
                                  <span className="text-green-400">${stock.targetPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Upside:</span>
                                  <span className="text-green-400">
                                    +{((stock.targetPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-white mb-3">Actions</h4>
                              <div className="space-y-2">
                                <button className="w-full btn-success text-sm py-2">
                                  Add to Watchlist
                                </button>
                                <button className="w-full btn-primary text-sm py-2">
                                  View Full Analysis
                                </button>
                                <button className="w-full btn-secondary text-sm py-2">
                                  Generate Report
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
