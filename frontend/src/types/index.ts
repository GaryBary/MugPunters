// User and Authentication Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Stock and Market Data Types
export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  market_cap: number;
  current_price: number;
  currency: string;
  last_updated: string;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: string;
}

export interface HistoricalData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close: number;
}

// Investment Analysis Types
export interface InvestmentReport {
  id: string;
  user_id: string;
  stock_symbol: string;
  title: string;
  summary: string;
  investment_thesis: string;
  risk_assessment: string;
  target_price: number;
  current_price: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence_level: number; // 1-10 scale
  created_at: string;
  updated_at: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface FinancialMetrics {
  symbol: string;
  pe_ratio: number;
  pb_ratio: number;
  debt_to_equity: number;
  roe: number;
  roa: number;
  current_ratio: number;
  quick_ratio: number;
  gross_margin: number;
  operating_margin: number;
  net_margin: number;
  revenue_growth: number;
  earnings_growth: number;
  dividend_yield: number;
  payout_ratio: number;
  calculated_at: string;
}

export interface TechnicalAnalysis {
  symbol: string;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  ema_12: number;
  ema_26: number;
  macd: number;
  macd_signal: number;
  rsi: number;
  bollinger_upper: number;
  bollinger_lower: number;
  support_level: number;
  resistance_level: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  calculated_at: string;
}

// Portfolio and Watchlist Types
export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description: string;
  stocks: string[];
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string;
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioHolding {
  id: string;
  portfolio_id: string;
  stock_symbol: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  market_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  last_updated: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form Types
export interface CreateReportForm {
  stock_symbol: string;
  title: string;
  summary: string;
  investment_thesis: string;
  risk_assessment: string;
  target_price: number;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence_level: number;
}

export interface UpdateReportForm extends Partial<CreateReportForm> {
  id: string;
}

// Dashboard Types
export interface DashboardStats {
  total_reports: number;
  active_watchlists: number;
  portfolio_value: number;
  total_gain_loss: number;
  top_performers: StockPrice[];
  recent_reports: InvestmentReport[];
}

// Market Data Types
export interface MarketOverview {
  asx_200: {
    value: number;
    change: number;
    change_percent: number;
  };
  sectors: {
    name: string;
    change_percent: number;
    top_stock: string;
  }[];
  top_gainers: StockPrice[];
  top_losers: StockPrice[];
  most_active: StockPrice[];
}

// Report Tracking Types
export interface ReportPerformance {
  report_id: string;
  stock_symbol: string;
  original_price: number;
  current_price: number;
  performance_pct: number;
  predicted_return?: number;
  actual_return: number;
  accuracy_score?: number;
  days_since_analysis?: number;
  last_updated: string;
}

export interface AnalysisReport {
  id: string;
  user_id: string;
  stock_symbol: string;
  risk_level: 'conservative' | 'moderate' | 'aggressive';
  timeframe: string;
  parameters: {
    technical_indicators: string[];
    fundamental_metrics: string[];
    risk_factors: string[];
  };
  results: {
    technical_score: number;
    fundamental_score: number;
    risk_score: number;
    overall_score: number;
    recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    confidence: number;
    target_price: number;
    key_metrics: Record<string, any>;
  };
  created_at: string;
  last_updated: string;
  performance?: ReportPerformance;
}

export interface ReEvaluationResponse {
  report_id: string;
  stock_symbol: string;
  original_analysis_date: string;
  re_evaluation_date: string;
  original_price: number;
  current_price: number;
  performance_pct: number;
  predicted_return?: number;
  actual_return: number;
  accuracy_score?: number;
  days_since_analysis: number;
  original_recommendation?: string;
  original_confidence?: number;
  original_target_price?: number;
  performance_summary: string;
}

export interface PerformanceMetrics {
  report_id: string;
  stock_symbol: string;
  analysis_date: string;
  last_updated: string;
  price_movement: {
    original_price: number;
    current_price: number;
    price_change: number;
    price_change_pct: number;
  };
  return_analysis: {
    predicted_return?: number;
    actual_return: number;
    return_difference: number;
    accuracy_score?: number;
  };
  time_analysis: {
    days_since_analysis?: number;
    analysis_timeframe: string;
    risk_level: string;
  };
  recommendation_accuracy: {
    recommendation: string;
    was_correct: boolean;
    performance: number;
    confidence: number;
  };
  performance_grade: string;
  benchmark_comparison: {
    benchmark_performance: number;
    outperformance: number;
    benchmark_name: string;
  };
}

export interface PerformanceSummary {
  total_reports: number;
  average_accuracy: number;
  total_performance: number;
  best_performer?: {
    symbol: string;
    performance: number;
    report_id: string;
  };
  worst_performer?: {
    symbol: string;
    performance: number;
    report_id: string;
  };
  recommendation_accuracy: Record<string, {
    total: number;
    positive: number;
    accuracy: number;
  }>;
  performance_distribution: {
    excellent: number;
    good: number;
    neutral: number;
    poor: number;
    terrible: number;
  };
}

export interface ReportListResponse {
  reports: AnalysisReport[];
  total: number;
  skip: number;
  limit: number;
}