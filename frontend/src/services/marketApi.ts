import { 
  Stock, 
  StockPrice, 
  HistoricalData, 
  TechnicalAnalysis, 
  FinancialMetrics,
  ApiResponse,
  PaginatedResponse 
} from '../types';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Helper function to get API URL with optional override
const getApiUrl = (endpoint: string): string => {
  // Check for API override in localStorage (for local development)
  const apiOverride = localStorage.getItem('api_base_url');
  const baseUrl = apiOverride || API_BASE_URL;
  return `${baseUrl}${endpoint}`;
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface StockPriceData {
  symbol: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: string;
  market_cap?: number;
  currency: string;
}

export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  website: string;
  employees?: number;
  market_cap?: number;
  enterprise_value?: number;
  trailing_pe?: number;
  forward_pe?: number;
  peg_ratio?: number;
  price_to_book?: number;
  dividend_yield?: number;
  dividend_rate?: number;
  payout_ratio?: number;
  beta?: number;
  '52_week_high'?: number;
  '52_week_low'?: number;
  currency: string;
  exchange: string;
  timestamp: string;
}

export interface HistoricalDataResponse {
  symbol: string;
  period: string;
  interval: string;
  data: HistoricalData[];
  count: number;
  timestamp: string;
}

export interface TechnicalIndicators {
  rsi: (number | null)[];
  macd: {
    macd: (number | null)[];
    signal: (number | null)[];
    histogram: (number | null)[];
  };
  sma: {
    [key: string]: (number | null)[];
  };
  ema: {
    [key: string]: (number | null)[];
  };
  bollinger_bands: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  };
  stochastic?: {
    k_percent: (number | null)[];
    d_percent: (number | null)[];
  };
}

export interface TechnicalSignals {
  rsi?: string;
  macd?: string;
  moving_averages?: string;
}

export interface TechnicalAnalysisResponse {
  success: boolean;
  symbol: string;
  indicators: TechnicalIndicators;
  signals: TechnicalSignals;
  data_points: number;
  analysis_date: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
}

export interface StockSearchResponse {
  query: string;
  results: StockSearchResult[];
  count: number;
}

export interface ComprehensiveStockData {
  success: boolean;
  symbol: string;
  price_data: StockPriceData;
  stock_info: StockInfo;
  technical_analysis: {
    indicators: TechnicalIndicators;
    signals: TechnicalSignals;
  };
  last_updated: string;
}

class MarketApiService {
  /**
   * Search for stocks by symbol or name
   */
  async searchStocks(query: string, limit: number = 10): Promise<StockSearchResponse> {
    const url = getApiUrl(`/stocks/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<StockSearchResponse>(response);
  }

  /**
   * Get current stock price and basic info
   */
  async getCurrentPrice(symbol: string): Promise<ApiResponse<StockPriceData>> {
    const url = getApiUrl(`/stocks/${encodeURIComponent(symbol)}/current`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<StockPriceData>>(response);
  }

  /**
   * Get detailed stock information
   */
  async getStockInfo(symbol: string): Promise<ApiResponse<StockInfo>> {
    const url = getApiUrl(`/stocks/${encodeURIComponent(symbol)}/info`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<StockInfo>>(response);
  }

  /**
   * Get historical data for a stock
   */
  async getHistoricalData(
    symbol: string, 
    period: string = '1y', 
    interval: string = '1d'
  ): Promise<ApiResponse<HistoricalDataResponse>> {
    const url = getApiUrl(
      `/stocks/${encodeURIComponent(symbol)}/historical?period=${period}&interval=${interval}`
    );
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<HistoricalDataResponse>>(response);
  }

  /**
   * Get technical analysis for a stock
   */
  async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysisResponse> {
    const url = getApiUrl(`/stocks/${encodeURIComponent(symbol)}/analysis`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<TechnicalAnalysisResponse>(response);
  }

  /**
   * Get comprehensive stock data (price, info, and analysis)
   */
  async getComprehensiveStockData(symbol: string): Promise<ComprehensiveStockData> {
    const url = getApiUrl(`/stocks/${encodeURIComponent(symbol)}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ComprehensiveStockData>(response);
  }

  /**
   * Get all stocks from database
   */
  async getAllStocks(skip: number = 0, limit: number = 100): Promise<{
    stocks: Stock[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const url = getApiUrl(`/stocks?skip=${skip}&limit=${limit}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<{
      stocks: Stock[];
      total: number;
      skip: number;
      limit: number;
    }>(response);
  }

  /**
   * Get multiple stock prices at once
   */
  async getMultipleStockPrices(symbols: string[]): Promise<StockPriceData[]> {
    const promises = symbols.map(symbol => 
      this.getCurrentPrice(symbol).catch(error => {
        console.error(`Failed to fetch price for ${symbol}:`, error);
        return null;
      })
    );
    
    const results = await Promise.all(promises);
    return results
      .filter(result => result !== null)
      .map(result => result!.data);
  }

  /**
   * Get market overview data (mock implementation)
   */
  async getMarketOverview(): Promise<{
    asx_200: { value: number; change: number; change_percent: number };
    top_gainers: StockPriceData[];
    top_losers: StockPriceData[];
    most_active: StockPriceData[];
  }> {
    // This would typically call a market overview endpoint
    // For now, we'll return mock data or fetch from major ASX stocks
    const majorStocks = ['CBA.AX', 'ANZ.AX', 'WBC.AX', 'NAB.AX', 'BHP.AX', 'RIO.AX'];
    
    try {
      const stockData = await this.getMultipleStockPrices(majorStocks);
      
      return {
        asx_200: {
          value: 7500, // Mock ASX 200 value
          change: 25.5,
          change_percent: 0.34
        },
        top_gainers: stockData
          .filter(stock => stock.change > 0)
          .sort((a, b) => b.change_percent - a.change_percent)
          .slice(0, 5),
        top_losers: stockData
          .filter(stock => stock.change < 0)
          .sort((a, b) => a.change_percent - b.change_percent)
          .slice(0, 5),
        most_active: stockData
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Failed to fetch market overview:', error);
      // Return empty data on error
      return {
        asx_200: { value: 0, change: 0, change_percent: 0 },
        top_gainers: [],
        top_losers: [],
        most_active: []
      };
    }
  }

  /**
   * Format symbol for display (remove .AX suffix)
   */
  formatSymbol(symbol: string): string {
    return symbol.replace('.AX', '');
  }

  /**
   * Format price with currency
   */
  formatPrice(price: number, currency: string = 'AUD'): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Format percentage change
   */
  formatPercentage(percentage: number): string {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  }

  /**
   * Get color class for price change
   */
  getChangeColorClass(change: number): string {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  /**
   * Check if market is open (simplified - assumes ASX hours)
   */
  isMarketOpen(): boolean {
    const now = new Date();
    const sydneyTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Sydney"}));
    const day = sydneyTime.getDay();
    const hour = sydneyTime.getHours();
    const minute = sydneyTime.getMinutes();
    
    // ASX is open Monday-Friday, 10:00 AM - 4:00 PM Sydney time
    if (day >= 1 && day <= 5) {
      const marketOpen = 10 * 60; // 10:00 AM in minutes
      const marketClose = 16 * 60; // 4:00 PM in minutes
      const currentTime = hour * 60 + minute;
      
      return currentTime >= marketOpen && currentTime <= marketClose;
    }
    
    return false;
  }
}

// Export singleton instance
export const marketApi = new MarketApiService();

// Export types for use in components
export type {
  StockPriceData,
  StockInfo,
  HistoricalDataResponse,
  TechnicalIndicators,
  TechnicalSignals,
  TechnicalAnalysisResponse,
  StockSearchResult,
  StockSearchResponse,
  ComprehensiveStockData
};
