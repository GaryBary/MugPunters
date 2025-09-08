from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Enum, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class RiskLevel(enum.Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class Recommendation(enum.Enum):
    STRONG_BUY = "strong_buy"
    BUY = "buy"
    HOLD = "hold"
    SELL = "sell"
    STRONG_SELL = "strong_sell"


class AnalysisStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class StockAnalysis(Base):
    """
    Database model for storing stock analysis results.
    """
    __tablename__ = "stock_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id"), nullable=True)
    symbol = Column(String(10), nullable=False, index=True)
    
    # Analysis parameters
    risk_level = Column(Enum(RiskLevel), nullable=False, default=RiskLevel.MODERATE)
    timeframe = Column(String(20), default="1y", nullable=False)
    
    # Analysis results
    technical_score = Column(Float, nullable=True)
    fundamental_score = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)
    recommendation = Column(Enum(Recommendation), nullable=True)
    confidence = Column(Float, nullable=True)
    
    # Key metrics (stored as JSON)
    key_metrics = Column(JSON, nullable=True)
    
    # Analysis metadata
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False)
    error_message = Column(Text, nullable=True)
    analysis_date = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="stock_analyses")
    stock = relationship("Stock")
    position_sizing = relationship("PositionSizing", back_populates="analysis", uselist=False)


class PositionSizing(Base):
    """
    Database model for storing position sizing calculations.
    """
    __tablename__ = "position_sizing"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("stock_analyses.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Position sizing parameters
    entry_price = Column(Float, nullable=False)
    stop_loss_price = Column(Float, nullable=False)
    portfolio_value = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    
    # Position sizing results
    recommended_position_size = Column(Float, nullable=False)
    max_position_size = Column(Float, nullable=False)
    risk_per_trade = Column(Float, nullable=False)
    position_value = Column(Float, nullable=False)
    risk_amount = Column(Float, nullable=False)
    
    # Additional risk metrics
    volatility = Column(Float, nullable=True)
    beta = Column(Float, nullable=True)
    atr = Column(Float, nullable=True)  # Average True Range
    
    # Metadata
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    analysis = relationship("StockAnalysis", back_populates="position_sizing")
    user = relationship("User")


class PortfolioRiskAssessment(Base):
    """
    Database model for storing portfolio risk assessments.
    """
    __tablename__ = "portfolio_risk_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Portfolio data (stored as JSON)
    holdings = Column(JSON, nullable=False)  # List of holdings with their data
    portfolio_value = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    
    # Risk assessment results
    portfolio_risk_score = Column(Float, nullable=False)
    max_drawdown = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    portfolio_beta = Column(Float, nullable=True)
    correlation_risk = Column(Float, nullable=True)
    concentration_risk = Column(Float, nullable=True)
    
    # Recommendations (stored as JSON array)
    recommendations = Column(JSON, nullable=True)
    
    # Metadata
    assessed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")


class AnalysisAlert(Base):
    """
    Database model for storing analysis alerts and notifications.
    """
    __tablename__ = "analysis_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("stock_analyses.id"), nullable=True)
    
    # Alert details
    alert_type = Column(String(50), nullable=False)  # e.g., "price_target", "stop_loss", "re_analysis"
    symbol = Column(String(10), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="medium", nullable=False)  # low, medium, high, critical
    
    # Alert conditions
    trigger_price = Column(Float, nullable=True)
    trigger_condition = Column(String(100), nullable=True)  # e.g., "price > 100", "rsi < 30"
    
    # Alert status
    is_active = Column(Boolean, default=True, nullable=False)
    is_triggered = Column(Boolean, default=False, nullable=False)
    triggered_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User")
    analysis = relationship("StockAnalysis")


class AnalysisTemplate(Base):
    """
    Database model for storing reusable analysis templates.
    """
    __tablename__ = "analysis_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Template details
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    
    # Template configuration
    risk_level = Column(Enum(RiskLevel), nullable=False)
    sectors = Column(JSON, nullable=True)  # List of sectors to focus on
    market_cap_range = Column(JSON, nullable=True)  # Min/max market cap
    technical_indicators = Column(JSON, nullable=True)  # Which indicators to use
    fundamental_metrics = Column(JSON, nullable=True)  # Which metrics to prioritize
    
    # Template usage
    usage_count = Column(Integer, default=0, nullable=False)
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")


class AnalysisReport(Base):
    """
    Database model for storing comprehensive analysis reports with tracking.
    """
    __tablename__ = "analysis_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stock_symbol = Column(String(10), nullable=False, index=True)
    
    # Analysis parameters (stored as JSON for flexibility)
    parameters = Column(JSON, nullable=False)  # Technical indicators, fundamental metrics, risk factors
    
    # Analysis results (stored as JSON for comprehensive data)
    results = Column(JSON, nullable=False)  # All analysis results including scores, recommendations, metrics
    
    # Report metadata
    risk_level = Column(Enum(RiskLevel), nullable=False)
    timeframe = Column(String(20), nullable=False, default="1y")
    
    # Tracking metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    user = relationship("User")
    performance_tracking = relationship("ReportPerformance", back_populates="report", cascade="all, delete-orphan")


class ReportPerformance(Base):
    """
    Database model for tracking report performance over time.
    """
    __tablename__ = "report_performance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("analysis_reports.id"), nullable=False)
    stock_symbol = Column(String(10), nullable=False, index=True)
    
    # Price tracking
    original_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    
    # Performance metrics
    performance_pct = Column(Float, nullable=False)  # Actual return percentage
    predicted_return = Column(Float, nullable=True)  # Original prediction
    actual_return = Column(Float, nullable=False)  # Actual return amount
    accuracy_score = Column(Float, nullable=True)  # How accurate the prediction was (0-1)
    
    # Additional tracking data
    days_since_analysis = Column(Integer, nullable=True)  # Days since original analysis
    market_conditions = Column(JSON, nullable=True)  # Market conditions at time of analysis vs current
    
    # Tracking metadata
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    report = relationship("AnalysisReport", back_populates="performance_tracking")