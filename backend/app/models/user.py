from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    investment_reports = relationship("InvestmentReport", back_populates="user")
    watchlists = relationship("Watchlist", back_populates="user")
    portfolios = relationship("Portfolio", back_populates="user")
    stock_analyses = relationship("StockAnalysis", back_populates="user")
    position_sizing = relationship("PositionSizing", back_populates="user")
    portfolio_risk_assessments = relationship("PortfolioRiskAssessment", back_populates="user")
    analysis_alerts = relationship("AnalysisAlert", back_populates="user")
    analysis_templates = relationship("AnalysisTemplate", back_populates="user")
