import { 
  AnalysisReport, 
  ReportListResponse, 
  ReEvaluationResponse, 
  PerformanceMetrics, 
  PerformanceSummary 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class ReportApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get user's analysis reports with optional filtering
   */
  async getReports(params: {
    skip?: number;
    limit?: number;
    risk_level?: 'conservative' | 'moderate' | 'aggressive';
    timeframe?: string;
    stock_symbol?: string;
  } = {}): Promise<ReportListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.risk_level) searchParams.append('risk_level', params.risk_level);
    if (params.timeframe) searchParams.append('timeframe', params.timeframe);
    if (params.stock_symbol) searchParams.append('stock_symbol', params.stock_symbol);

    const queryString = searchParams.toString();
    const endpoint = `/reports${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ReportListResponse>(endpoint);
  }

  /**
   * Get a specific analysis report
   */
  async getReport(reportId: string): Promise<AnalysisReport> {
    return this.makeRequest<AnalysisReport>(`/reports/${reportId}`);
  }

  /**
   * Create a new analysis report
   */
  async createReport(reportData: {
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
  }): Promise<AnalysisReport> {
    return this.makeRequest<AnalysisReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  /**
   * Re-evaluate a report by comparing original vs current data
   */
  async reEvaluateReport(reportId: string): Promise<ReEvaluationResponse> {
    return this.makeRequest<ReEvaluationResponse>(`/reports/${reportId}/re-evaluate`, {
      method: 'POST',
    });
  }

  /**
   * Get detailed performance metrics for a specific report
   */
  async getReportPerformance(reportId: string): Promise<PerformanceMetrics> {
    return this.makeRequest<PerformanceMetrics>(`/reports/${reportId}/performance`);
  }

  /**
   * Get overall performance summary for user's reports
   */
  async getPerformanceSummary(): Promise<PerformanceSummary> {
    return this.makeRequest<PerformanceSummary>('/reports/performance/summary');
  }
}

// Export a singleton instance
export const reportApi = new ReportApiService();
export default reportApi;
