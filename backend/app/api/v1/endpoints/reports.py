from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.analysis import RiskLevel
from app.schemas.analysis import (
    ReportListResponse,
    AnalysisReportResponse,
    ReEvaluationResponse,
    PerformanceMetricsResponse,
    PerformanceSummaryResponse,
    SaveReportRequest
)
from app.services.report_manager import ReportManagerService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=ReportListResponse)
async def get_reports(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    risk_level: Optional[RiskLevel] = Query(None, description="Filter by risk level"),
    timeframe: Optional[str] = Query(None, description="Filter by timeframe"),
    stock_symbol: Optional[str] = Query(None, description="Filter by stock symbol"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ReportListResponse:
    """
    Retrieve user's analysis reports with optional filtering.
    """
    try:
        report_manager = ReportManagerService(db)
        reports = await report_manager.get_user_reports(
            user_id=str(current_user.id),
            skip=skip,
            limit=limit,
            risk_level=risk_level,
            timeframe=timeframe,
            stock_symbol=stock_symbol
        )
        
        # Convert to response format
        report_responses = []
        for report in reports:
            performance_data = None
            if report.performance_tracking:
                perf = report.performance_tracking[0]
                performance_data = {
                    "report_id": str(perf.report_id),
                    "stock_symbol": perf.stock_symbol,
                    "original_price": perf.original_price,
                    "current_price": perf.current_price,
                    "performance_pct": perf.performance_pct,
                    "predicted_return": perf.predicted_return,
                    "actual_return": perf.actual_return,
                    "accuracy_score": perf.accuracy_score,
                    "days_since_analysis": perf.days_since_analysis,
                    "last_updated": perf.last_updated
                }
            
            report_responses.append({
                "id": str(report.id),
                "user_id": str(report.user_id),
                "stock_symbol": report.stock_symbol,
                "risk_level": report.risk_level,
                "timeframe": report.timeframe,
                "parameters": report.parameters,
                "results": report.results,
                "created_at": report.created_at,
                "last_updated": report.last_updated,
                "performance": performance_data
            })
        
        return ReportListResponse(
            reports=report_responses,
            total=len(report_responses),  # In real implementation, get total count from DB
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Failed to get reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve reports")


@router.post("/", response_model=AnalysisReportResponse)
async def create_report(
    report_data: SaveReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AnalysisReportResponse:
    """
    Create new analysis report with performance tracking.
    """
    try:
        report_manager = ReportManagerService(db)
        report = await report_manager.save_analysis_report(
            user_id=str(current_user.id),
            stock_symbol=report_data.stock_symbol,
            parameters=report_data.parameters,
            results=report_data.results,
            risk_level=report_data.risk_level,
            timeframe=report_data.timeframe
        )
        
        # Convert to response format
        performance_data = None
        if report.performance_tracking:
            perf = report.performance_tracking[0]
            performance_data = {
                "report_id": str(perf.report_id),
                "stock_symbol": perf.stock_symbol,
                "original_price": perf.original_price,
                "current_price": perf.current_price,
                "performance_pct": perf.performance_pct,
                "predicted_return": perf.predicted_return,
                "actual_return": perf.actual_return,
                "accuracy_score": perf.accuracy_score,
                "days_since_analysis": perf.days_since_analysis,
                "last_updated": perf.last_updated
            }
        
        return AnalysisReportResponse(
            id=str(report.id),
            user_id=str(report.user_id),
            stock_symbol=report.stock_symbol,
            risk_level=report.risk_level,
            timeframe=report.timeframe,
            parameters=report.parameters,
            results=report.results,
            created_at=report.created_at,
            last_updated=report.last_updated,
            performance=performance_data
        )
        
    except Exception as e:
        logger.error(f"Failed to create report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create report")


@router.get("/{report_id}", response_model=AnalysisReportResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AnalysisReportResponse:
    """
    Get a specific analysis report.
    """
    try:
        report_manager = ReportManagerService(db)
        reports = await report_manager.get_user_reports(
            user_id=str(current_user.id),
            stock_symbol=None  # Get all reports, then filter by ID
        )
        
        # Find the specific report
        report = next((r for r in reports if str(r.id) == report_id), None)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Convert to response format
        performance_data = None
        if report.performance_tracking:
            perf = report.performance_tracking[0]
            performance_data = {
                "report_id": str(perf.report_id),
                "stock_symbol": perf.stock_symbol,
                "original_price": perf.original_price,
                "current_price": perf.current_price,
                "performance_pct": perf.performance_pct,
                "predicted_return": perf.predicted_return,
                "actual_return": perf.actual_return,
                "accuracy_score": perf.accuracy_score,
                "days_since_analysis": perf.days_since_analysis,
                "last_updated": perf.last_updated
            }
        
        return AnalysisReportResponse(
            id=str(report.id),
            user_id=str(report.user_id),
            stock_symbol=report.stock_symbol,
            risk_level=report.risk_level,
            timeframe=report.timeframe,
            parameters=report.parameters,
            results=report.results,
            created_at=report.created_at,
            last_updated=report.last_updated,
            performance=performance_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get report {report_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve report")


@router.post("/{report_id}/re-evaluate", response_model=ReEvaluationResponse)
async def re_evaluate_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ReEvaluationResponse:
    """
    Re-evaluate a report by comparing original vs current data.
    """
    try:
        report_manager = ReportManagerService(db)
        
        # Verify the report belongs to the user
        reports = await report_manager.get_user_reports(
            user_id=str(current_user.id),
            stock_symbol=None
        )
        
        report = next((r for r in reports if str(r.id) == report_id), None)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Perform re-evaluation
        re_evaluation_results = await report_manager.re_evaluate_report(report_id)
        
        return ReEvaluationResponse(**re_evaluation_results)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to re-evaluate report {report_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to re-evaluate report")


@router.get("/{report_id}/performance", response_model=PerformanceMetricsResponse)
async def get_report_performance(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PerformanceMetricsResponse:
    """
    Get detailed performance metrics for a specific report.
    """
    try:
        report_manager = ReportManagerService(db)
        
        # Verify the report belongs to the user
        reports = await report_manager.get_user_reports(
            user_id=str(current_user.id),
            stock_symbol=None
        )
        
        report = next((r for r in reports if str(r.id) == report_id), None)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Get performance metrics
        performance_metrics = await report_manager.calculate_report_performance(report_id)
        
        return PerformanceMetricsResponse(**performance_metrics)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get performance for report {report_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve performance metrics")


@router.get("/performance/summary", response_model=PerformanceSummaryResponse)
async def get_performance_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PerformanceSummaryResponse:
    """
    Get overall performance summary for user's reports.
    """
    try:
        report_manager = ReportManagerService(db)
        summary = await report_manager.get_performance_summary(str(current_user.id))
        
        return PerformanceSummaryResponse(**summary)
        
    except Exception as e:
        logger.error(f"Failed to get performance summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve performance summary")
