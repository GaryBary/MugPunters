"""
Fundamental analysis module for ASX stocks
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from dataclasses import dataclass


@dataclass
class FinancialMetrics:
    """Financial metrics for fundamental analysis"""
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    roe: Optional[float] = None  # Return on Equity
    roa: Optional[float] = None  # Return on Assets
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    net_margin: Optional[float] = None
    revenue_growth: Optional[float] = None
    earnings_growth: Optional[float] = None
    dividend_yield: Optional[float] = None
    payout_ratio: Optional[float] = None


@dataclass
class ValuationMetrics:
    """Valuation metrics for stock analysis"""
    intrinsic_value: Optional[float] = None
    fair_value_range: tuple = (None, None)
    margin_of_safety: Optional[float] = None
    dcf_value: Optional[float] = None
    pe_valuation: Optional[float] = None
    pb_valuation: Optional[float] = None


class FundamentalAnalyzer:
    """
    Fundamental analysis engine for ASX stocks
    """
    
    def __init__(self):
        self.industry_benchmarks = self._load_industry_benchmarks()
    
    def _load_industry_benchmarks(self) -> Dict[str, Dict[str, float]]:
        """
        Load industry benchmark ratios for comparison
        """
        return {
            "Banks": {
                "pe_ratio": 12.0,
                "pb_ratio": 1.2,
                "roe": 12.0,
                "debt_to_equity": 0.3
            },
            "Mining": {
                "pe_ratio": 15.0,
                "pb_ratio": 1.5,
                "roe": 15.0,
                "debt_to_equity": 0.4
            },
            "Healthcare": {
                "pe_ratio": 25.0,
                "pb_ratio": 3.0,
                "roe": 20.0,
                "debt_to_equity": 0.2
            },
            "Technology": {
                "pe_ratio": 30.0,
                "pb_ratio": 4.0,
                "roe": 25.0,
                "debt_to_equity": 0.1
            },
            "Retail": {
                "pe_ratio": 18.0,
                "pb_ratio": 2.0,
                "roe": 18.0,
                "debt_to_equity": 0.3
            }
        }
    
    def calculate_financial_metrics(self, financial_data: Dict[str, Any]) -> FinancialMetrics:
        """
        Calculate comprehensive financial metrics from raw data
        """
        try:
            # Extract data
            market_cap = financial_data.get("market_cap", 0)
            current_price = financial_data.get("current_price", 0)
            shares_outstanding = financial_data.get("shares_outstanding", 0)
            
            # Income Statement
            revenue = financial_data.get("revenue", 0)
            gross_profit = financial_data.get("gross_profit", 0)
            operating_income = financial_data.get("operating_income", 0)
            net_income = financial_data.get("net_income", 0)
            
            # Balance Sheet
            total_assets = financial_data.get("total_assets", 0)
            total_equity = financial_data.get("total_equity", 0)
            total_debt = financial_data.get("total_debt", 0)
            current_assets = financial_data.get("current_assets", 0)
            current_liabilities = financial_data.get("current_liabilities", 0)
            inventory = financial_data.get("inventory", 0)
            
            # Cash Flow
            dividends_paid = financial_data.get("dividends_paid", 0)
            
            # Calculate ratios
            pe_ratio = (current_price * shares_outstanding) / net_income if net_income > 0 else None
            pb_ratio = market_cap / total_equity if total_equity > 0 else None
            debt_to_equity = total_debt / total_equity if total_equity > 0 else None
            roe = net_income / total_equity if total_equity > 0 else None
            roa = net_income / total_assets if total_assets > 0 else None
            current_ratio = current_assets / current_liabilities if current_liabilities > 0 else None
            quick_ratio = (current_assets - inventory) / current_liabilities if current_liabilities > 0 else None
            
            # Margin calculations
            gross_margin = (gross_profit / revenue) * 100 if revenue > 0 else None
            operating_margin = (operating_income / revenue) * 100 if revenue > 0 else None
            net_margin = (net_income / revenue) * 100 if revenue > 0 else None
            
            # Growth calculations (would need historical data)
            revenue_growth = financial_data.get("revenue_growth", None)
            earnings_growth = financial_data.get("earnings_growth", None)
            
            # Dividend metrics
            dividend_yield = (dividends_paid / market_cap) * 100 if market_cap > 0 else None
            payout_ratio = dividends_paid / net_income if net_income > 0 else None
            
            return FinancialMetrics(
                pe_ratio=pe_ratio,
                pb_ratio=pb_ratio,
                debt_to_equity=debt_to_equity,
                roe=roe,
                roa=roa,
                current_ratio=current_ratio,
                quick_ratio=quick_ratio,
                gross_margin=gross_margin,
                operating_margin=operating_margin,
                net_margin=net_margin,
                revenue_growth=revenue_growth,
                earnings_growth=earnings_growth,
                dividend_yield=dividend_yield,
                payout_ratio=payout_ratio
            )
            
        except Exception as e:
            print(f"Error calculating financial metrics: {e}")
            return FinancialMetrics()
    
    def analyze_financial_health(self, metrics: FinancialMetrics, industry: str) -> Dict[str, Any]:
        """
        Analyze financial health and provide scores
        """
        benchmark = self.industry_benchmarks.get(industry, {})
        
        scores = {
            "profitability": 0,
            "liquidity": 0,
            "leverage": 0,
            "efficiency": 0,
            "overall": 0
        }
        
        # Profitability Score (0-100)
        profitability_score = 0
        if metrics.roe is not None:
            benchmark_roe = benchmark.get("roe", 15.0)
            if metrics.roe >= benchmark_roe * 1.2:
                profitability_score += 40
            elif metrics.roe >= benchmark_roe:
                profitability_score += 30
            elif metrics.roe >= benchmark_roe * 0.8:
                profitability_score += 20
        
        if metrics.net_margin is not None:
            if metrics.net_margin >= 15:
                profitability_score += 30
            elif metrics.net_margin >= 10:
                profitability_score += 20
            elif metrics.net_margin >= 5:
                profitability_score += 10
        
        if metrics.operating_margin is not None:
            if metrics.operating_margin >= 20:
                profitability_score += 30
            elif metrics.operating_margin >= 15:
                profitability_score += 20
            elif metrics.operating_margin >= 10:
                profitability_score += 10
        
        scores["profitability"] = min(profitability_score, 100)
        
        # Liquidity Score (0-100)
        liquidity_score = 0
        if metrics.current_ratio is not None:
            if metrics.current_ratio >= 2.0:
                liquidity_score += 50
            elif metrics.current_ratio >= 1.5:
                liquidity_score += 40
            elif metrics.current_ratio >= 1.0:
                liquidity_score += 30
        
        if metrics.quick_ratio is not None:
            if metrics.quick_ratio >= 1.0:
                liquidity_score += 50
            elif metrics.quick_ratio >= 0.8:
                liquidity_score += 40
            elif metrics.quick_ratio >= 0.5:
                liquidity_score += 30
        
        scores["liquidity"] = min(liquidity_score, 100)
        
        # Leverage Score (0-100) - Lower debt is better
        leverage_score = 100
        if metrics.debt_to_equity is not None:
            benchmark_debt = benchmark.get("debt_to_equity", 0.3)
            if metrics.debt_to_equity > benchmark_debt * 2:
                leverage_score = 20
            elif metrics.debt_to_equity > benchmark_debt * 1.5:
                leverage_score = 40
            elif metrics.debt_to_equity > benchmark_debt:
                leverage_score = 60
            elif metrics.debt_to_equity > benchmark_debt * 0.5:
                leverage_score = 80
        
        scores["leverage"] = leverage_score
        
        # Efficiency Score (0-100)
        efficiency_score = 0
        if metrics.roa is not None:
            if metrics.roa >= 10:
                efficiency_score += 50
            elif metrics.roa >= 7:
                efficiency_score += 40
            elif metrics.roa >= 5:
                efficiency_score += 30
        
        if metrics.asset_turnover is not None:
            if metrics.asset_turnover >= 1.0:
                efficiency_score += 50
            elif metrics.asset_turnover >= 0.8:
                efficiency_score += 40
            elif metrics.asset_turnover >= 0.6:
                efficiency_score += 30
        
        scores["efficiency"] = min(efficiency_score, 100)
        
        # Overall Score
        scores["overall"] = (
            scores["profitability"] * 0.3 +
            scores["liquidity"] * 0.2 +
            scores["leverage"] * 0.2 +
            scores["efficiency"] * 0.3
        )
        
        return {
            "scores": scores,
            "recommendation": self._get_recommendation(scores["overall"]),
            "strengths": self._identify_strengths(metrics, scores),
            "weaknesses": self._identify_weaknesses(metrics, scores)
        }
    
    def calculate_intrinsic_value(
        self, 
        financial_data: Dict[str, Any], 
        growth_rate: float = 0.05,
        discount_rate: float = 0.10
    ) -> ValuationMetrics:
        """
        Calculate intrinsic value using DCF and other valuation methods
        """
        try:
            # DCF Calculation (simplified)
            current_earnings = financial_data.get("net_income", 0)
            shares_outstanding = financial_data.get("shares_outstanding", 1)
            
            # Project future cash flows (simplified 5-year projection)
            projected_earnings = []
            for year in range(1, 6):
                projected_earnings.append(current_earnings * ((1 + growth_rate) ** year))
            
            # Calculate present value
            dcf_value = 0
            for i, earnings in enumerate(projected_earnings):
                dcf_value += earnings / ((1 + discount_rate) ** (i + 1))
            
            # Add terminal value (simplified)
            terminal_value = projected_earnings[-1] / (discount_rate - growth_rate)
            dcf_value += terminal_value / ((1 + discount_rate) ** 5)
            
            dcf_per_share = dcf_value / shares_outstanding
            
            # PE-based valuation
            industry_pe = 15.0  # Would come from industry analysis
            pe_valuation = current_earnings * industry_pe / shares_outstanding
            
            # PB-based valuation
            book_value = financial_data.get("total_equity", 0)
            industry_pb = 1.5  # Would come from industry analysis
            pb_valuation = book_value * industry_pb / shares_outstanding
            
            # Fair value range
            fair_value_low = min(dcf_per_share, pe_valuation, pb_valuation) * 0.8
            fair_value_high = max(dcf_per_share, pe_valuation, pb_valuation) * 1.2
            
            return ValuationMetrics(
                intrinsic_value=dcf_per_share,
                fair_value_range=(fair_value_low, fair_value_high),
                dcf_value=dcf_per_share,
                pe_valuation=pe_valuation,
                pb_valuation=pb_valuation
            )
            
        except Exception as e:
            print(f"Error calculating intrinsic value: {e}")
            return ValuationMetrics()
    
    def _get_recommendation(self, overall_score: float) -> str:
        """Get investment recommendation based on overall score"""
        if overall_score >= 80:
            return "STRONG_BUY"
        elif overall_score >= 70:
            return "BUY"
        elif overall_score >= 60:
            return "HOLD"
        elif overall_score >= 40:
            return "WEAK_HOLD"
        else:
            return "SELL"
    
    def _identify_strengths(self, metrics: FinancialMetrics, scores: Dict[str, float]) -> List[str]:
        """Identify company strengths"""
        strengths = []
        
        if scores["profitability"] >= 70:
            strengths.append("Strong profitability metrics")
        if scores["liquidity"] >= 70:
            strengths.append("Excellent liquidity position")
        if scores["leverage"] >= 70:
            strengths.append("Conservative debt levels")
        if scores["efficiency"] >= 70:
            strengths.append("Efficient asset utilization")
        
        if metrics.dividend_yield and metrics.dividend_yield >= 4:
            strengths.append("Attractive dividend yield")
        
        return strengths
    
    def _identify_weaknesses(self, metrics: FinancialMetrics, scores: Dict[str, float]) -> List[str]:
        """Identify company weaknesses"""
        weaknesses = []
        
        if scores["profitability"] < 50:
            weaknesses.append("Weak profitability metrics")
        if scores["liquidity"] < 50:
            weaknesses.append("Poor liquidity position")
        if scores["leverage"] < 50:
            weaknesses.append("High debt levels")
        if scores["efficiency"] < 50:
            weaknesses.append("Inefficient asset utilization")
        
        if metrics.pe_ratio and metrics.pe_ratio > 30:
            weaknesses.append("High valuation (PE ratio)")
        
        return weaknesses
