from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    exchange = Column(String(10), default="ASX", nullable=False)
    sector = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    market_cap = Column(Float, nullable=True)
    current_price = Column(Float, nullable=True)
    currency = Column(String(3), default="AUD", nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    investment_reports = relationship("InvestmentReport", back_populates="stock")
    portfolio_holdings = relationship("PortfolioHolding", back_populates="stock")
    watchlist_stocks = relationship("WatchlistStock", back_populates="stock")
    financial_metrics = relationship("FinancialMetrics", back_populates="stock")
    technical_analysis = relationship("TechnicalAnalysis", back_populates="stock")
    historical_data = relationship("HistoricalData", back_populates="stock")


class FinancialMetrics(Base):
    __tablename__ = "financial_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stock_id = Column(UUID(as_uuid=True), nullable=False)
    pe_ratio = Column(Float, nullable=True)
    pb_ratio = Column(Float, nullable=True)
    debt_to_equity = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)  # Return on Equity
    roa = Column(Float, nullable=True)  # Return on Assets
    current_ratio = Column(Float, nullable=True)
    quick_ratio = Column(Float, nullable=True)
    gross_margin = Column(Float, nullable=True)
    operating_margin = Column(Float, nullable=True)
    net_margin = Column(Float, nullable=True)
    revenue_growth = Column(Float, nullable=True)
    earnings_growth = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)
    payout_ratio = Column(Float, nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    stock = relationship("Stock", back_populates="financial_metrics")


class TechnicalAnalysis(Base):
    __tablename__ = "technical_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stock_id = Column(UUID(as_uuid=True), nullable=False)
    sma_20 = Column(Float, nullable=True)  # Simple Moving Average 20
    sma_50 = Column(Float, nullable=True)  # Simple Moving Average 50
    sma_200 = Column(Float, nullable=True)  # Simple Moving Average 200
    ema_12 = Column(Float, nullable=True)  # Exponential Moving Average 12
    ema_26 = Column(Float, nullable=True)  # Exponential Moving Average 26
    macd = Column(Float, nullable=True)  # MACD Line
    macd_signal = Column(Float, nullable=True)  # MACD Signal Line
    rsi = Column(Float, nullable=True)  # Relative Strength Index
    bollinger_upper = Column(Float, nullable=True)
    bollinger_lower = Column(Float, nullable=True)
    support_level = Column(Float, nullable=True)
    resistance_level = Column(Float, nullable=True)
    trend = Column(Enum('BULLISH', 'BEARISH', 'NEUTRAL', name='trend_enum'), nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    stock = relationship("Stock", back_populates="technical_analysis")


class HistoricalData(Base):
    __tablename__ = "historical_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stock_id = Column(UUID(as_uuid=True), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    open_price = Column(Float, nullable=False)
    high_price = Column(Float, nullable=False)
    low_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)
    adjusted_close = Column(Float, nullable=True)
    
    # Relationships
    stock = relationship("Stock", back_populates="historical_data")
