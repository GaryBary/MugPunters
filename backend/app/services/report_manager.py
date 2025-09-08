"""
Report Manager Service

Handles saving, retrieving, and tracking analysis reports with performance monitoring.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func
from sqlalchemy.orm import selectinload
import uuid
import logging

from app.models.analysis import AnalysisReport, ReportPerformance, RiskLevel
from app.models.user import User
from app.services.market_data import MarketDataService

logger = logging.getLogger(__name__)


class ReportManagerService:
    """Service for managing analysis reports and performance tracking."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.market_data_service = MarketDataService()
    
    async def save_analysis_report(
        self,
        user_id: str,
        stock_symbol: str,
        parameters: Dict[str, Any],
        results: Dict[str, Any],
        risk_level: RiskLevel,
        timeframe: str = "1y"
    ) -> AnalysisReport:
        """
        Save a new analysis report with all parameters and results.
        
        Args:
            user_id: ID of the user creating the report
            stock_symbol: Stock symbol being analyzed
            parameters: Analysis parameters (indicators, metrics, etc.)
            results: Analysis results (scores, recommendations, etc.)
            risk_level: Risk level used for analysis
            timeframe: Analysis timeframe
            
        Returns:
            The created AnalysisReport object
        """
        try:
            # Get current stock price for performance tracking
            current_price = await self._get_current_stock_price(stock_symbol)
            
            # Create the analysis report
            report = AnalysisReport(
                user_id=uuid.UUID(user_id),
                stock_symbol=stock_symbol.upper(),
                parameters=parameters,
                results=results,
                risk_level=risk_level,
                timeframe=timeframe
            )
            
            self.db.add(report)
            await self.db.flush()  # Get the ID
            
            # Create initial performance tracking entry
            performance = ReportPerformance(
                report_id=report.id,
                stock_symbol=stock_symbol.upper(),
                original_price=current_price,
                current_price=current_price,
                performance_pct=0.0,
                predicted_return=results.get('predicted_return', 0.0),
                actual_return=0.0,
                accuracy_score=None,  # Will be calculated later
                days_since_analysis=0
            )
            
            self.db.add(performance)
            await self.db.commit()
            
            logger.info(f"Saved analysis report {report.id} for {stock_symbol}")
            return report
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to save analysis report: {str(e)}")
            raise
    
    async def get_user_reports(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        risk_level: Optional[RiskLevel] = None,
        timeframe: Optional[str] = None,
        stock_symbol: Optional[str] = None
    ) -> List[AnalysisReport]:
        """
        Retrieve user's analysis reports with optional filtering.
        
        Args:
            user_id: ID of the user
            skip: Number of records to skip
            limit: Maximum number of records to return
            risk_level: Filter by risk level
            timeframe: Filter by timeframe
            stock_symbol: Filter by stock symbol
            
        Returns:
            List of AnalysisReport objects
        """
        try:
            query = select(AnalysisReport).where(
                and_(
                    AnalysisReport.user_id == uuid.UUID(user_id),
                    AnalysisReport.is_active == True
                )
            )
            
            # Apply filters
            if risk_level:
                query = query.where(AnalysisReport.risk_level == risk_level)
            
            if timeframe:
                query = query.where(AnalysisReport.timeframe == timeframe)
            
            if stock_symbol:
                query = query.where(AnalysisReport.stock_symbol == stock_symbol.upper())
            
            # Order by creation date (newest first)
            query = query.order_by(desc(AnalysisReport.created_at))
            
            # Apply pagination
            query = query.offset(skip).limit(limit)
            
            # Load performance tracking data
            query = query.options(selectinload(AnalysisReport.performance_tracking))
            
            result = await self.db.execute(query)
            reports = result.scalars().all()
            
            # Update performance data for each report
            for report in reports:
                await self._update_report_performance(report)
            
            return reports
            
        except Exception as e:
            logger.error(f"Failed to get user reports: {str(e)}")
            raise
    
    async def re_evaluate_report(self, report_id: str) -> Dict[str, Any]:
        """
        Re-evaluate a report by comparing original vs current data.
        
        Args:
            report_id: ID of the report to re-evaluate
            
        Returns:
            Dictionary with re-evaluation results
        """
        try:
            # Get the report with performance tracking
            query = select(AnalysisReport).options(
                selectinload(AnalysisReport.performance_tracking)
            ).where(AnalysisReport.id == uuid.UUID(report_id))
            
            result = await self.db.execute(query)
            report = result.scalar_one_or_none()
            
            if not report:
                raise ValueError(f"Report {report_id} not found")
            
            # Get current stock price
            current_price = await self._get_current_stock_price(report.stock_symbol)
            
            # Get or create performance tracking record
            performance = report.performance_tracking[0] if report.performance_tracking else None
            
            if not performance:
                # Create new performance tracking record
                performance = ReportPerformance(
                    report_id=report.id,
                    stock_symbol=report.stock_symbol,
                    original_price=report.results.get('current_price', 0.0),
                    current_price=current_price,
                    performance_pct=0.0,
                    predicted_return=report.results.get('predicted_return', 0.0),
                    actual_return=0.0,
                    accuracy_score=None,
                    days_since_analysis=0
                )
                self.db.add(performance)
            else:
                # Update existing performance tracking
                performance.current_price = current_price
                performance.last_updated = datetime.utcnow()
            
            # Calculate performance metrics
            original_price = performance.original_price
            performance.performance_pct = ((current_price - original_price) / original_price) * 100
            performance.actual_return = current_price - original_price
            
            # Calculate days since analysis
            days_diff = (datetime.utcnow() - report.created_at).days
            performance.days_since_analysis = days_diff
            
            # Calculate accuracy score
            predicted_return = performance.predicted_return or 0.0
            if predicted_return != 0:
                # Accuracy based on how close actual return is to predicted return
                accuracy = 1.0 - abs(performance.performance_pct - predicted_return) / abs(predicted_return)
                performance.accuracy_score = max(0.0, min(1.0, accuracy))
            else:
                performance.accuracy_score = 0.5  # Neutral score if no prediction
            
            await self.db.commit()
            
            # Prepare re-evaluation results
            re_evaluation_results = {
                "report_id": str(report.id),
                "stock_symbol": report.stock_symbol,
                "original_analysis_date": report.created_at.isoformat(),
                "re_evaluation_date": datetime.utcnow().isoformat(),
                "original_price": original_price,
                "current_price": current_price,
                "performance_pct": performance.performance_pct,
                "predicted_return": predicted_return,
                "actual_return": performance.actual_return,
                "accuracy_score": performance.accuracy_score,
                "days_since_analysis": days_diff,
                "original_recommendation": report.results.get('recommendation'),
                "original_confidence": report.results.get('confidence'),
                "original_target_price": report.results.get('target_price'),
                "performance_summary": self._generate_performance_summary(performance)
            }
            
            logger.info(f"Re-evaluated report {report_id} - Performance: {performance.performance_pct:.2f}%")
            return re_evaluation_results
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to re-evaluate report {report_id}: {str(e)}")
            raise
    
    async def calculate_report_performance(self, report_id: str) -> Dict[str, Any]:
        """
        Calculate detailed performance metrics for a report.
        
        Args:
            report_id: ID of the report
            
        Returns:
            Dictionary with performance metrics
        """
        try:
            # Get the report with performance tracking
            query = select(AnalysisReport).options(
                selectinload(AnalysisReport.performance_tracking)
            ).where(AnalysisReport.id == uuid.UUID(report_id))
            
            result = await self.db.execute(query)
            report = result.scalar_one_or_none()
            
            if not report:
                raise ValueError(f"Report {report_id} not found")
            
            performance = report.performance_tracking[0] if report.performance_tracking else None
            
            if not performance:
                # Create performance tracking if it doesn't exist
                await self.re_evaluate_report(report_id)
                # Re-fetch the report
                result = await self.db.execute(query)
                report = result.scalar_one_or_none()
                performance = report.performance_tracking[0]
            
            # Calculate additional performance metrics
            performance_metrics = {
                "report_id": str(report.id),
                "stock_symbol": report.stock_symbol,
                "analysis_date": report.created_at.isoformat(),
                "last_updated": performance.last_updated.isoformat(),
                "price_movement": {
                    "original_price": performance.original_price,
                    "current_price": performance.current_price,
                    "price_change": performance.current_price - performance.original_price,
                    "price_change_pct": performance.performance_pct
                },
                "return_analysis": {
                    "predicted_return": performance.predicted_return,
                    "actual_return": performance.actual_return,
                    "return_difference": performance.actual_return - (performance.predicted_return or 0),
                    "accuracy_score": performance.accuracy_score
                },
                "time_analysis": {
                    "days_since_analysis": performance.days_since_analysis,
                    "analysis_timeframe": report.timeframe,
                    "risk_level": report.risk_level.value
                },
                "recommendation_accuracy": self._assess_recommendation_accuracy(report, performance),
                "performance_grade": self._calculate_performance_grade(performance),
                "benchmark_comparison": await self._get_benchmark_comparison(report.stock_symbol, report.created_at)
            }
            
            return performance_metrics
            
        except Exception as e:
            logger.error(f"Failed to calculate performance for report {report_id}: {str(e)}")
            raise
    
    async def get_performance_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Get overall performance summary for a user's reports.
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary with performance summary
        """
        try:
            # Get all user reports with performance data
            query = select(AnalysisReport).options(
                selectinload(AnalysisReport.performance_tracking)
            ).where(
                and_(
                    AnalysisReport.user_id == uuid.UUID(user_id),
                    AnalysisReport.is_active == True
                )
            )
            
            result = await self.db.execute(query)
            reports = result.scalars().all()
            
            if not reports:
                return {
                    "total_reports": 0,
                    "average_accuracy": 0.0,
                    "total_performance": 0.0,
                    "best_performer": None,
                    "worst_performer": None,
                    "recommendation_accuracy": {}
                }
            
            # Calculate summary metrics
            total_reports = len(reports)
            accuracy_scores = []
            performance_scores = []
            best_performer = None
            worst_performer = None
            recommendation_stats = {}
            
            for report in reports:
                if report.performance_tracking:
                    performance = report.performance_tracking[0]
                    
                    if performance.accuracy_score is not None:
                        accuracy_scores.append(performance.accuracy_score)
                    
                    performance_scores.append(performance.performance_pct)
                    
                    # Track best/worst performers
                    if best_performer is None or performance.performance_pct > best_performer['performance']:
                        best_performer = {
                            'symbol': report.stock_symbol,
                            'performance': performance.performance_pct,
                            'report_id': str(report.id)
                        }
                    
                    if worst_performer is None or performance.performance_pct < worst_performer['performance']:
                        worst_performer = {
                            'symbol': report.stock_symbol,
                            'performance': performance.performance_pct,
                            'report_id': str(report.id)
                        }
                    
                    # Track recommendation accuracy
                    recommendation = report.results.get('recommendation', 'hold')
                    if recommendation not in recommendation_stats:
                        recommendation_stats[recommendation] = {'total': 0, 'positive': 0}
                    
                    recommendation_stats[recommendation]['total'] += 1
                    if performance.performance_pct > 0:
                        recommendation_stats[recommendation]['positive'] += 1
            
            # Calculate averages
            average_accuracy = sum(accuracy_scores) / len(accuracy_scores) if accuracy_scores else 0.0
            total_performance = sum(performance_scores) / len(performance_scores) if performance_scores else 0.0
            
            # Calculate recommendation accuracy percentages
            for rec in recommendation_stats:
                total = recommendation_stats[rec]['total']
                positive = recommendation_stats[rec]['positive']
                recommendation_stats[rec]['accuracy'] = (positive / total * 100) if total > 0 else 0.0
            
            return {
                "total_reports": total_reports,
                "average_accuracy": average_accuracy,
                "total_performance": total_performance,
                "best_performer": best_performer,
                "worst_performer": worst_performer,
                "recommendation_accuracy": recommendation_stats,
                "performance_distribution": self._calculate_performance_distribution(performance_scores)
            }
            
        except Exception as e:
            logger.error(f"Failed to get performance summary for user {user_id}: {str(e)}")
            raise
    
    async def _get_current_stock_price(self, stock_symbol: str) -> float:
        """Get current stock price from market data service."""
        try:
            # This would integrate with your market data service
            # For now, return a mock price
            mock_prices = {
                'CBA': 92.30,
                'BHP': 39.80,
                'WBC': 27.20,
                'ANZ': 25.50,
                'NAB': 28.90
            }
            return mock_prices.get(stock_symbol.upper(), 50.0)
        except Exception as e:
            logger.error(f"Failed to get current price for {stock_symbol}: {str(e)}")
            return 0.0
    
    async def _update_report_performance(self, report: AnalysisReport) -> None:
        """Update performance data for a report."""
        try:
            if not report.performance_tracking:
                return
            
            performance = report.performance_tracking[0]
            current_price = await self._get_current_stock_price(report.stock_symbol)
            
            if current_price != performance.current_price:
                performance.current_price = current_price
                performance.performance_pct = ((current_price - performance.original_price) / performance.original_price) * 100
                performance.actual_return = current_price - performance.original_price
                performance.last_updated = datetime.utcnow()
                
                # Recalculate accuracy score
                if performance.predicted_return:
                    accuracy = 1.0 - abs(performance.performance_pct - performance.predicted_return) / abs(performance.predicted_return)
                    performance.accuracy_score = max(0.0, min(1.0, accuracy))
                
                await self.db.commit()
                
        except Exception as e:
            logger.error(f"Failed to update performance for report {report.id}: {str(e)}")
    
    def _generate_performance_summary(self, performance: ReportPerformance) -> str:
        """Generate a human-readable performance summary."""
        if performance.performance_pct > 5:
            return "Strong positive performance"
        elif performance.performance_pct > 0:
            return "Positive performance"
        elif performance.performance_pct > -5:
            return "Neutral performance"
        else:
            return "Negative performance"
    
    def _assess_recommendation_accuracy(self, report: AnalysisReport, performance: ReportPerformance) -> Dict[str, Any]:
        """Assess how accurate the original recommendation was."""
        recommendation = report.results.get('recommendation', 'hold')
        performance_pct = performance.performance_pct
        
        # Define what constitutes "correct" for each recommendation
        correct = False
        if recommendation in ['strong_buy', 'buy'] and performance_pct > 0:
            correct = True
        elif recommendation in ['strong_sell', 'sell'] and performance_pct < 0:
            correct = True
        elif recommendation == 'hold' and -2 < performance_pct < 2:
            correct = True
        
        return {
            "recommendation": recommendation,
            "was_correct": correct,
            "performance": performance_pct,
            "confidence": report.results.get('confidence', 0.0)
        }
    
    def _calculate_performance_grade(self, performance: ReportPerformance) -> str:
        """Calculate a letter grade for the performance."""
        if performance.accuracy_score is None:
            return "N/A"
        
        if performance.accuracy_score >= 0.8:
            return "A"
        elif performance.accuracy_score >= 0.7:
            return "B"
        elif performance.accuracy_score >= 0.6:
            return "C"
        elif performance.accuracy_score >= 0.5:
            return "D"
        else:
            return "F"
    
    async def _get_benchmark_comparison(self, stock_symbol: str, analysis_date: datetime) -> Dict[str, Any]:
        """Compare performance against market benchmark."""
        # This would integrate with market data to get benchmark performance
        # For now, return mock data
        return {
            "benchmark_performance": 2.5,  # Market average
            "outperformance": 1.8,  # How much better/worse than benchmark
            "benchmark_name": "ASX 200"
        }
    
    def _calculate_performance_distribution(self, performance_scores: List[float]) -> Dict[str, int]:
        """Calculate distribution of performance scores."""
        distribution = {
            "excellent": 0,  # > 10%
            "good": 0,       # 5-10%
            "neutral": 0,    # -5 to 5%
            "poor": 0,       # -10 to -5%
            "terrible": 0    # < -10%
        }
        
        for score in performance_scores:
            if score > 10:
                distribution["excellent"] += 1
            elif score > 5:
                distribution["good"] += 1
            elif score > -5:
                distribution["neutral"] += 1
            elif score > -10:
                distribution["poor"] += 1
            else:
                distribution["terrible"] += 1
        
        return distribution
