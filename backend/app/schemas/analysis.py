from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class Recommendation(str, Enum):
    STRONG_BUY = "strong_buy"
    BUY = "buy"
    HOLD = "hold"
    SELL = "sell"
    STRONG_SELL = "strong_sell"


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


# Request Schemas
class AnalysisRequest(BaseModel):
    symbol: str = Field(..., description="Stock symbol to analyze", example="CBA")
    risk_level: RiskLevel = Field(..., description="Risk tolerance level")
    timeframe: str = Field(default="1y", description="Analysis timeframe", example="1y")
    sectors: Optional[List[str]] = Field(None, description="Sectors to focus on")
    
    @validator('symbol')
    def validate_symbol(cls, v):
        return v.upper().strip()


class PositionSizeRequest(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    entry_price: float = Field(..., gt=0, description="Entry price per share")
    stop_loss_price: float = Field(..., gt=0, description="Stop loss price per share")
    portfolio_value: float = Field(..., gt=0, description="Total portfolio value")
    risk_level: RiskLevel = Field(..., description="Risk tolerance level")
    volatility: Optional[float] = Field(None, ge=0, le=1, description="Stock volatility (0-1)")
    beta: Optional[float] = Field(None, gt=0, description="Stock beta")
    analysis_id: Optional[str] = Field(None, description="Associated analysis ID")
    
    @validator('symbol')
    def validate_symbol(cls, v):
        return v.upper().strip()
    
    @validator('stop_loss_price')
    def validate_stop_loss(cls, v, values):
        if 'entry_price' in values and v == values['entry_price']:
            raise ValueError('Stop loss price must be different from entry price')
        return v


class PortfolioRiskRequest(BaseModel):
    holdings: List[Dict[str, Any]] = Field(..., description="List of portfolio holdings")
    portfolio_value: float = Field(..., gt=0, description="Total portfolio value")
    risk_level: RiskLevel = Field(..., description="Risk tolerance level")
    
    @validator('holdings')
    def validate_holdings(cls, v):
        if not v:
            raise ValueError('Holdings list cannot be empty')
        
        required_fields = ['symbol', 'value', 'weight']
        for holding in v:
            for field in required_fields:
                if field not in holding:
                    raise ValueError(f'Missing required field: {field}')
        
        return v


class AnalysisTemplateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    risk_level: RiskLevel = Field(..., description="Default risk level")
    sectors: Optional[List[str]] = Field(None, description="Sectors to focus on")
    market_cap_range: Optional[Dict[str, float]] = Field(None, description="Market cap range")
    technical_indicators: Optional[List[str]] = Field(None, description="Technical indicators to use")
    fundamental_metrics: Optional[List[str]] = Field(None, description="Fundamental metrics to prioritize")
    is_public: bool = Field(default=False, description="Make template public")


# Response Schemas
class AnalysisResponse(BaseModel):
    id: str = Field(..., description="Analysis ID")
    symbol: str = Field(..., description="Stock symbol")
    status: AnalysisStatus = Field(..., description="Analysis status")
    
    # Analysis results (only present when completed)
    technical_score: Optional[float] = Field(None, ge=0, le=100, description="Technical analysis score")
    fundamental_score: Optional[float] = Field(None, ge=0, le=100, description="Fundamental analysis score")
    risk_score: Optional[float] = Field(None, ge=0, le=100, description="Risk assessment score")
    overall_score: Optional[float] = Field(None, ge=0, le=100, description="Overall analysis score")
    recommendation: Optional[Recommendation] = Field(None, description="Buy/sell/hold recommendation")
    confidence: Optional[float] = Field(None, ge=0, le=1, description="Analysis confidence level")
    key_metrics: Optional[Dict[str, Any]] = Field(None, description="Key stock metrics")
    analysis_date: Optional[datetime] = Field(None, description="Analysis completion date")
    risk_level: Optional[RiskLevel] = Field(None, description="Risk level used")
    
    # Position sizing (if calculated)
    position_sizing: Optional[Dict[str, Any]] = Field(None, description="Position sizing data")
    
    # Status messages
    message: Optional[str] = Field(None, description="Status message")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    
    class Config:
        from_attributes = True


class PositionSizeResponse(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    recommended_position_size: float = Field(..., ge=0, description="Recommended number of shares")
    max_position_size: float = Field(..., ge=0, description="Maximum allowed position size")
    risk_per_trade: float = Field(..., ge=0, le=1, description="Risk per trade as percentage")
    stop_loss_price: float = Field(..., gt=0, description="Stop loss price")
    position_value: float = Field(..., ge=0, description="Total position value")
    risk_amount: float = Field(..., ge=0, description="Total risk amount")
    
    class Config:
        from_attributes = True


class PortfolioRiskResponse(BaseModel):
    total_portfolio_value: float = Field(..., ge=0, description="Total portfolio value")
    portfolio_risk_score: float = Field(..., ge=0, le=100, description="Portfolio risk score")
    max_drawdown: Optional[float] = Field(None, ge=0, le=1, description="Estimated maximum drawdown")
    sharpe_ratio: Optional[float] = Field(None, description="Estimated Sharpe ratio")
    beta: float = Field(..., gt=0, description="Portfolio beta")
    correlation_risk: float = Field(..., ge=0, le=1, description="Correlation risk level")
    concentration_risk: float = Field(..., ge=0, le=1, description="Concentration risk level")
    recommendations: List[str] = Field(..., description="Risk management recommendations")
    
    class Config:
        from_attributes = True


class AnalysisTemplateResponse(BaseModel):
    id: str = Field(..., description="Template ID")
    name: str = Field(..., description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    risk_level: RiskLevel = Field(..., description="Default risk level")
    sectors: Optional[List[str]] = Field(None, description="Sectors to focus on")
    market_cap_range: Optional[Dict[str, float]] = Field(None, description="Market cap range")
    technical_indicators: Optional[List[str]] = Field(None, description="Technical indicators")
    fundamental_metrics: Optional[List[str]] = Field(None, description="Fundamental metrics")
    is_public: bool = Field(..., description="Is template public")
    usage_count: int = Field(..., ge=0, description="Number of times used")
    created_at: datetime = Field(..., description="Creation date")
    updated_at: datetime = Field(..., description="Last update date")
    
    class Config:
        from_attributes = True


class AnalysisListItem(BaseModel):
    id: str = Field(..., description="Analysis ID")
    symbol: str = Field(..., description="Stock symbol")
    status: AnalysisStatus = Field(..., description="Analysis status")
    overall_score: Optional[float] = Field(None, ge=0, le=100, description="Overall score")
    recommendation: Optional[Recommendation] = Field(None, description="Recommendation")
    analysis_date: datetime = Field(..., description="Analysis date")
    risk_level: RiskLevel = Field(..., description="Risk level used")


class AnalysisListResponse(BaseModel):
    analyses: List[AnalysisListItem] = Field(..., description="List of analyses")
    total: int = Field(..., ge=0, description="Total number of analyses")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of records returned")


# Additional schemas for detailed analysis
class TechnicalAnalysisDetail(BaseModel):
    rsi: Optional[float] = Field(None, ge=0, le=100, description="Relative Strength Index")
    macd: Optional[float] = Field(None, description="MACD signal")
    sma_20: Optional[float] = Field(None, gt=0, description="20-day Simple Moving Average")
    sma_50: Optional[float] = Field(None, gt=0, description="50-day Simple Moving Average")
    sma_200: Optional[float] = Field(None, gt=0, description="200-day Simple Moving Average")
    trend: Optional[str] = Field(None, description="Trend direction")
    volume_ratio: Optional[float] = Field(None, gt=0, description="Current vs average volume")


class FundamentalAnalysisDetail(BaseModel):
    pe_ratio: Optional[float] = Field(None, gt=0, description="Price-to-Earnings ratio")
    pb_ratio: Optional[float] = Field(None, gt=0, description="Price-to-Book ratio")
    market_cap: Optional[float] = Field(None, gt=0, description="Market capitalization")
    dividend_yield: Optional[float] = Field(None, ge=0, description="Dividend yield")
    beta: Optional[float] = Field(None, gt=0, description="Stock beta")
    peg_ratio: Optional[float] = Field(None, gt=0, description="PEG ratio")
    debt_to_equity: Optional[float] = Field(None, ge=0, description="Debt-to-equity ratio")
    roe: Optional[float] = Field(None, description="Return on Equity")


class RiskAnalysisDetail(BaseModel):
    volatility: Optional[float] = Field(None, ge=0, description="Annualized volatility")
    beta: Optional[float] = Field(None, gt=0, description="Stock beta")
    market_cap_risk: Optional[str] = Field(None, description="Market cap risk category")
    sector_risk: Optional[str] = Field(None, description="Sector risk assessment")


class DetailedAnalysisResponse(AnalysisResponse):
    """Extended analysis response with detailed breakdowns."""
    technical_detail: Optional[TechnicalAnalysisDetail] = Field(None, description="Detailed technical analysis")
    fundamental_detail: Optional[FundamentalAnalysisDetail] = Field(None, description="Detailed fundamental analysis")
    risk_detail: Optional[RiskAnalysisDetail] = Field(None, description="Detailed risk analysis")
    
    class Config:
        from_attributes = True


# Report Tracking Schemas
class ReportPerformanceResponse(BaseModel):
    """Response schema for report performance tracking."""
    report_id: str = Field(..., description="Report ID")
    stock_symbol: str = Field(..., description="Stock symbol")
    original_price: float = Field(..., gt=0, description="Original stock price at analysis")
    current_price: float = Field(..., gt=0, description="Current stock price")
    performance_pct: float = Field(..., description="Performance percentage")
    predicted_return: Optional[float] = Field(None, description="Original predicted return")
    actual_return: float = Field(..., description="Actual return amount")
    accuracy_score: Optional[float] = Field(None, ge=0, le=1, description="Prediction accuracy score")
    days_since_analysis: Optional[int] = Field(None, ge=0, description="Days since original analysis")
    last_updated: datetime = Field(..., description="Last performance update")
    
    class Config:
        from_attributes = True


class AnalysisReportResponse(BaseModel):
    """Response schema for analysis reports with performance tracking."""
    id: str = Field(..., description="Report ID")
    user_id: str = Field(..., description="User ID")
    stock_symbol: str = Field(..., description="Stock symbol")
    risk_level: RiskLevel = Field(..., description="Risk level used")
    timeframe: str = Field(..., description="Analysis timeframe")
    parameters: Dict[str, Any] = Field(..., description="Analysis parameters")
    results: Dict[str, Any] = Field(..., description="Analysis results")
    created_at: datetime = Field(..., description="Creation date")
    last_updated: datetime = Field(..., description="Last update date")
    performance: Optional[ReportPerformanceResponse] = Field(None, description="Performance tracking data")
    
    class Config:
        from_attributes = True


class ReEvaluationResponse(BaseModel):
    """Response schema for report re-evaluation."""
    report_id: str = Field(..., description="Report ID")
    stock_symbol: str = Field(..., description="Stock symbol")
    original_analysis_date: str = Field(..., description="Original analysis date")
    re_evaluation_date: str = Field(..., description="Re-evaluation date")
    original_price: float = Field(..., gt=0, description="Original stock price")
    current_price: float = Field(..., gt=0, description="Current stock price")
    performance_pct: float = Field(..., description="Performance percentage")
    predicted_return: Optional[float] = Field(None, description="Original predicted return")
    actual_return: float = Field(..., description="Actual return")
    accuracy_score: Optional[float] = Field(None, ge=0, le=1, description="Accuracy score")
    days_since_analysis: int = Field(..., ge=0, description="Days since analysis")
    original_recommendation: Optional[str] = Field(None, description="Original recommendation")
    original_confidence: Optional[float] = Field(None, ge=0, le=1, description="Original confidence")
    original_target_price: Optional[float] = Field(None, gt=0, description="Original target price")
    performance_summary: str = Field(..., description="Performance summary")
    
    class Config:
        from_attributes = True


class PerformanceMetricsResponse(BaseModel):
    """Response schema for detailed performance metrics."""
    report_id: str = Field(..., description="Report ID")
    stock_symbol: str = Field(..., description="Stock symbol")
    analysis_date: str = Field(..., description="Analysis date")
    last_updated: str = Field(..., description="Last update date")
    price_movement: Dict[str, Any] = Field(..., description="Price movement data")
    return_analysis: Dict[str, Any] = Field(..., description="Return analysis")
    time_analysis: Dict[str, Any] = Field(..., description="Time analysis")
    recommendation_accuracy: Dict[str, Any] = Field(..., description="Recommendation accuracy")
    performance_grade: str = Field(..., description="Performance grade")
    benchmark_comparison: Dict[str, Any] = Field(..., description="Benchmark comparison")
    
    class Config:
        from_attributes = True


class PerformanceSummaryResponse(BaseModel):
    """Response schema for user performance summary."""
    total_reports: int = Field(..., ge=0, description="Total number of reports")
    average_accuracy: float = Field(..., ge=0, le=1, description="Average accuracy score")
    total_performance: float = Field(..., description="Total performance percentage")
    best_performer: Optional[Dict[str, Any]] = Field(None, description="Best performing report")
    worst_performer: Optional[Dict[str, Any]] = Field(None, description="Worst performing report")
    recommendation_accuracy: Dict[str, Any] = Field(..., description="Recommendation accuracy by type")
    performance_distribution: Dict[str, int] = Field(..., description="Performance distribution")
    
    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Response schema for paginated report list."""
    reports: List[AnalysisReportResponse] = Field(..., description="List of reports")
    total: int = Field(..., ge=0, description="Total number of reports")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of records returned")
    
    class Config:
        from_attributes = True


class SaveReportRequest(BaseModel):
    """Request schema for saving analysis reports."""
    stock_symbol: str = Field(..., description="Stock symbol to analyze")
    risk_level: RiskLevel = Field(..., description="Risk level for analysis")
    timeframe: str = Field(default="1y", description="Analysis timeframe")
    parameters: Dict[str, Any] = Field(..., description="Analysis parameters")
    results: Dict[str, Any] = Field(..., description="Analysis results")
    
    @validator('stock_symbol')
    def validate_symbol(cls, v):
        return v.upper().strip()
    
    @validator('parameters')
    def validate_parameters(cls, v):
        required_keys = ['technical_indicators', 'fundamental_metrics', 'risk_factors']
        for key in required_keys:
            if key not in v:
                raise ValueError(f'Missing required parameter: {key}')
        return v
    
    @validator('results')
    def validate_results(cls, v):
        required_keys = ['technical_score', 'fundamental_score', 'risk_score', 'overall_score', 'recommendation']
        for key in required_keys:
            if key not in v:
                raise ValueError(f'Missing required result: {key}')
        return v