import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Target,
  Activity,
  Zap,
  Shield,
  Clock,
  CheckSquare,
  Play,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useQuery } from 'react-query';
import { useApiError } from '../hooks/useApiError';
import { useUserPreferences } from '../hooks/useLocalStorage';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface MarketOverview {
  index: string;
  value: number;
  change: number;
  changePercent: number;
  volume: string;
}

interface TopMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const Dashboard: React.FC = () => {
  const { handleError, handleSuccess, handleLoading } = useApiError();
  const { preferences, updatePreferences } = useUserPreferences();
  
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive' | 'speculative'>(preferences.riskTolerance);
  const [investmentHorizon, setInvestmentHorizon] = useState<'short' | 'medium' | 'long'>('medium');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(preferences.preferredSectors);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  // Fetch market data with error handling
  const { data: marketData, isLoading: marketLoading, error: marketError, refetch: refetchMarket } = useQuery(
    'marketOverview',
    async () => {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        overview: {
          index: 'ASX 200',
          value: 7234.56,
          change: 45.23,
          changePercent: 0.63,
          volume: '2.4B'
        },
        topMovers: [
          { symbol: 'BHP', name: 'BHP Group', price: 45.67, change: 1.42, changePercent: 3.2 },
          { symbol: 'CBA', name: 'Commonwealth Bank', price: 98.45, change: 2.68, changePercent: 2.8 },
          { symbol: 'CSL', name: 'CSL Limited', price: 234.56, change: 4.82, changePercent: 2.1 },
          { symbol: 'WBC', name: 'Westpac Banking', price: 22.34, change: 0.45, changePercent: 2.0 },
          { symbol: 'ANZ', name: 'ANZ Banking', price: 25.67, change: 0.48, changePercent: 1.9 }
        ]
      };
    },
    {
      retry: 2,
      refetchInterval: 30000, // Refetch every 30 seconds
      onError: (error) => {
        handleError(error, 'Failed to load market data');
      }
    }
  );

  // Update preferences when they change
  useEffect(() => {
    updatePreferences({
      riskTolerance,
      preferredSectors: selectedSectors
    });
  }, [riskTolerance, selectedSectors, updatePreferences]);

  const sectors = [
    { id: 'technology', name: 'Technology', icon: Zap },
    { id: 'mining', name: 'Mining', icon: Activity },
    { id: 'healthcare', name: 'Healthcare', icon: Shield },
    { id: 'finance', name: 'Finance', icon: DollarSign },
    { id: 'energy', name: 'Energy', icon: BarChart3 },
    { id: 'consumer', name: 'Consumer', icon: Target },
    { id: 'utilities', name: 'Utilities', icon: Clock },
    { id: 'materials', name: 'Materials', icon: Activity }
  ];

  const riskLevels = [
    { id: 'conservative', name: 'Conservative', description: 'Low risk, stable returns', color: 'text-green-400' },
    { id: 'moderate', name: 'Moderate', description: 'Balanced risk and return', color: 'text-yellow-400' },
    { id: 'aggressive', name: 'Aggressive', description: 'Higher risk, higher returns', color: 'text-orange-400' },
    { id: 'speculative', name: 'Speculative', description: 'Very high risk, volatile', color: 'text-red-400' }
  ];

  const horizons = [
    { id: 'short', name: 'Short-term', description: '1-2 years', icon: Clock },
    { id: 'medium', name: 'Medium-term', description: '3-5 years', icon: Target },
    { id: 'long', name: 'Long-term', description: '5+ years', icon: Shield }
  ];

  const handleSectorToggle = (sectorId: string) => {
    setSelectedSectors(prev => 
      prev.includes(sectorId) 
        ? prev.filter(id => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const handleGenerateAnalysis = async () => {
    if (isGeneratingAnalysis) return;
    
    setIsGeneratingAnalysis(true);
    const loadingToast = handleLoading('Generating investment analysis...');
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      handleSuccess('Analysis generated successfully!');
      toast.dismiss(loadingToast);
      
      // Navigate to analysis results or show results modal
      console.log('Analysis generated with:', {
        riskTolerance,
        investmentHorizon,
        selectedSectors
      });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      handleError(error, 'Failed to generate analysis');
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const handleRefreshMarketData = () => {
    refetchMarket();
    handleSuccess('Market data refreshed');
  };

  // Show loading state
  if (marketLoading && !marketData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading market data..." />
      </div>
    );
  }

  // Show error state
  if (marketError && !marketData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Market Data</h2>
          <p className="text-gray-300 mb-4">
            We couldn't load the latest market information. Please check your connection and try again.
          </p>
          <button
            onClick={handleRefreshMarketData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const marketOverview = marketData?.overview;
  const topMovers = marketData?.topMovers || [];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Mug Punters Investment Research Platform
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced ASX Market Analysis & Investment Recommendations
          </p>
          {marketLoading && (
            <div className="flex items-center justify-center mt-4">
              <LoadingSpinner size="sm" color="white" text="Updating market data..." />
            </div>
          )}
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* ASX 200 Overview */}
          <div className="card bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">ASX 200</p>
                <p className="text-3xl font-bold text-white">{marketOverview.value.toLocaleString()}</p>
                <p className="text-green-400 text-sm font-medium">
                  +{marketOverview.change} (+{marketOverview.changePercent}%)
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          {/* Volume */}
          <div className="card bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Volume</p>
                <p className="text-3xl font-bold text-white">{marketOverview.volume}</p>
                <p className="text-purple-200 text-sm">Total traded</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          {/* Top Gainer */}
          <div className="card bg-gradient-to-br from-green-600 to-green-800 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Top Gainer</p>
                <p className="text-2xl font-bold text-white">{topMovers[0].symbol}</p>
                <p className="text-green-400 text-sm font-medium">
                  +{topMovers[0].changePercent}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="card bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Sentiment</p>
                <p className="text-2xl font-bold text-white">Bullish</p>
                <p className="text-orange-200 text-sm">Positive trend</p>
              </div>
              <Activity className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Investment Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Tolerance & Investment Horizon */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="h-6 w-6 mr-3 text-primary-400" />
              Investment Profile
            </h2>
            
            {/* Risk Tolerance Slider */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Risk Tolerance
              </label>
              <div className="space-y-3">
                {riskLevels.map((level) => (
                  <label key={level.id} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="riskTolerance"
                      value={level.id}
                      checked={riskTolerance === level.id}
                      onChange={(e) => setRiskTolerance(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                      riskTolerance === level.id 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${level.color}`}>{level.name}</h3>
                          <p className="text-sm text-gray-400">{level.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          riskTolerance === level.id 
                            ? 'border-primary-500 bg-primary-500' 
                            : 'border-gray-500'
                        }`} />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Investment Horizon */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Investment Horizon
              </label>
              <div className="grid grid-cols-1 gap-3">
                {horizons.map((horizon) => {
                  const Icon = horizon.icon;
                  return (
                    <label key={horizon.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="investmentHorizon"
                        value={horizon.id}
                        checked={investmentHorizon === horizon.id}
                        onChange={(e) => setInvestmentHorizon(e.target.value as any)}
                        className="sr-only"
                      />
                      <div className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                        investmentHorizon === horizon.id 
                          ? 'border-primary-500 bg-primary-500/10' 
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 text-primary-400 mr-3" />
                            <div>
                              <h3 className="font-semibold text-white">{horizon.name}</h3>
                              <p className="text-sm text-gray-400">{horizon.description}</p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            investmentHorizon === horizon.id 
                              ? 'border-primary-500 bg-primary-500' 
                              : 'border-gray-500'
                          }`} />
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sector Selection */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CheckSquare className="h-6 w-6 mr-3 text-primary-400" />
              Market Sectors
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {sectors.map((sector) => {
                const Icon = sector.icon;
                const isSelected = selectedSectors.includes(sector.id);
                return (
                  <label key={sector.id} className="cursor-pointer">
                    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className={`h-5 w-5 mr-3 ${isSelected ? 'text-primary-400' : 'text-gray-400'}`} />
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {sector.name}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded border-2 ${
                          isSelected 
                            ? 'border-primary-500 bg-primary-500' 
                            : 'border-gray-500'
                        }`}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSectorToggle(sector.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Movers */}
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-3 text-primary-400" />
            Top Market Movers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topMovers.map((stock, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{stock.symbol}</h3>
                  <span className="text-green-400 text-sm font-medium">
                    +{stock.changePercent}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stock.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">${stock.price.toFixed(2)}</span>
                  <span className="text-green-400 text-sm">+${stock.change.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Analysis Button */}
        <div className="text-center">
          <button
            onClick={handleGenerateAnalysis}
            disabled={isGeneratingAnalysis}
            className={`bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center mx-auto ${
              isGeneratingAnalysis ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGeneratingAnalysis ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Play className="h-6 w-6 mr-3" />
            )}
            {isGeneratingAnalysis ? 'Generating Analysis...' : 'Generate Investment Analysis'}
          </button>
          <p className="text-gray-400 text-sm mt-3">
            AI-powered analysis based on your investment profile and market conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
