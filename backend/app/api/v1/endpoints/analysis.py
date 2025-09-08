from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.analysis import (
    StockAnalysis, PositionSizing, PortfolioRiskAssessment, 
    AnalysisAlert, AnalysisTemplate, RiskLevel, Recommendation, AnalysisStatus
)
from app.analysis.stock_analyzer import StockAnalyzer, RiskLevel as AnalyzerRiskLevel
from app.analysis.risk_calculator import RiskCalculator, RiskLevel as CalculatorRiskLevel
from app.schemas.analysis import (
    AnalysisRequest, AnalysisResponse, PositionSizeRequest, PositionSizeResponse,
    PortfolioRiskRequest, PortfolioRiskResponse, AnalysisTemplateRequest,
    AnalysisTemplateResponse, AnalysisListResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate", response_model=AnalysisResponse)
async def generate_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate comprehensive stock analysis.
    
    Args:
        request: Analysis parameters including symbol, risk level, timeframe
        background_tasks: For running analysis in background
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        AnalysisResponse with analysis results
    """
    try:
        # Convert string risk level to enum
        risk_level_map = {
            "conservative": AnalyzerRiskLevel.CONSERVATIVE,
            "moderate": AnalyzerRiskLevel.MODERATE,
            "aggressive": AnalyzerRiskLevel.AGGRESSIVE
        }
        
        analyzer_risk_level = risk_level_map.get(request.risk_level.lower())
        if not analyzer_risk_level:
            raise HTTPException(status_code=400, detail="Invalid risk level")
        
        # Create analysis record
        analysis = StockAnalysis(
            user_id=current_user.id,
            symbol=request.symbol.upper(),
            risk_level=RiskLevel(request.risk_level.lower()),
            timeframe=request.timeframe,
            status=AnalysisStatus.IN_PROGRESS
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # Run analysis in background
        background_tasks.add_task(
            run_stock_analysis,
            analysis.id,
            request.symbol,
            analyzer_risk_level,
            request.timeframe,
            db
        )
        
        return AnalysisResponse(
            id=str(analysis.id),
            symbol=analysis.symbol,
            status=analysis.status.value,
            message="Analysis started. Results will be available shortly."
        )
        
    except Exception as e:
        logger.error(f"Error starting analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get analysis results by ID.
    
    Args:
        analysis_id: Analysis ID
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        AnalysisResponse with complete analysis results
    """
    try:
        analysis = db.query(StockAnalysis).filter(
            StockAnalysis.id == analysis_id,
            StockAnalysis.user_id == current_user.id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        if analysis.status == AnalysisStatus.FAILED:
            return AnalysisResponse(
                id=str(analysis.id),
                symbol=analysis.symbol,
                status=analysis.status.value,
                error_message=analysis.error_message
            )
        
        if analysis.status != AnalysisStatus.COMPLETED:
            return AnalysisResponse(
                id=str(analysis.id),
                symbol=analysis.symbol,
                status=analysis.status.value,
                message="Analysis in progress..."
            )
        
        # Get position sizing if available
        position_sizing = db.query(PositionSizing).filter(
            PositionSizing.analysis_id == analysis.id
        ).first()
        
        return AnalysisResponse(
            id=str(analysis.id),
            symbol=analysis.symbol,
            status=analysis.status.value,
            technical_score=analysis.technical_score,
            fundamental_score=analysis.fundamental_score,
            risk_score=analysis.risk_score,
            overall_score=analysis.overall_score,
            recommendation=analysis.recommendation.value if analysis.recommendation else None,
            confidence=analysis.confidence,
            key_metrics=analysis.key_metrics,
            analysis_date=analysis.analysis_date,
            risk_level=analysis.risk_level.value,
            position_sizing=position_sizing.__dict__ if position_sizing else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")


@router.post("/{analysis_id}/re-evaluate", response_model=AnalysisResponse)
async def re_evaluate_analysis(
    analysis_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Re-evaluate an existing analysis with updated data.
    
    Args:
        analysis_id: Analysis ID to re-evaluate
        background_tasks: For running analysis in background
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        AnalysisResponse with updated analysis status
    """
    try:
        analysis = db.query(StockAnalysis).filter(
            StockAnalysis.id == analysis_id,
            StockAnalysis.user_id == current_user.id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Update status to in progress
        analysis.status = AnalysisStatus.IN_PROGRESS
        analysis.error_message = None
        db.commit()
        
        # Convert risk level
        risk_level_map = {
            "conservative": AnalyzerRiskLevel.CONSERVATIVE,
            "moderate": AnalyzerRiskLevel.MODERATE,
            "aggressive": AnalyzerRiskLevel.AGGRESSIVE
        }
        
        analyzer_risk_level = risk_level_map.get(analysis.risk_level.value)
        
        # Run re-analysis in background
        background_tasks.add_task(
            run_stock_analysis,
            analysis.id,
            analysis.symbol,
            analyzer_risk_level,
            analysis.timeframe,
            db
        )
        
        return AnalysisResponse(
            id=str(analysis.id),
            symbol=analysis.symbol,
            status=analysis.status.value,
            message="Re-evaluation started. Results will be available shortly."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error re-evaluating analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to re-evaluate analysis: {str(e)}")


@router.post("/position-size", response_model=PositionSizeResponse)
async def calculate_position_size(
    request: PositionSizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate optimal position size for a stock.
    
    Args:
        request: Position sizing parameters
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        PositionSizeResponse with position sizing recommendations
    """
    try:
        # Convert risk level
        risk_level_map = {
            "conservative": CalculatorRiskLevel.CONSERVATIVE,
            "moderate": CalculatorRiskLevel.MODERATE,
            "aggressive": CalculatorRiskLevel.AGGRESSIVE
        }
        
        calculator_risk_level = risk_level_map.get(request.risk_level.lower())
        if not calculator_risk_level:
            raise HTTPException(status_code=400, detail="Invalid risk level")
        
        # Create risk calculator
        risk_calculator = RiskCalculator()
        
        # Calculate position size
        result = risk_calculator.calculate_position_size(
            symbol=request.symbol,
            entry_price=request.entry_price,
            stop_loss_price=request.stop_loss_price,
            portfolio_value=request.portfolio_value,
            risk_level=calculator_risk_level,
            volatility=request.volatility,
            beta=request.beta
        )
        
        # Save to database if analysis_id provided
        if request.analysis_id:
            position_sizing = PositionSizing(
                analysis_id=request.analysis_id,
                user_id=current_user.id,
                entry_price=request.entry_price,
                stop_loss_price=request.stop_loss_price,
                portfolio_value=request.portfolio_value,
                risk_level=RiskLevel(request.risk_level.lower()),
                recommended_position_size=result.recommended_position_size,
                max_position_size=result.max_position_size,
                risk_per_trade=result.risk_per_trade,
                position_value=result.position_value,
                risk_amount=result.risk_amount,
                volatility=request.volatility,
                beta=request.beta
            )
            db.add(position_sizing)
            db.commit()
        
        return PositionSizeResponse(
            symbol=result.symbol,
            recommended_position_size=result.recommended_position_size,
            max_position_size=result.max_position_size,
            risk_per_trade=result.risk_per_trade,
            stop_loss_price=result.stop_loss_price,
            position_value=result.position_value,
            risk_amount=result.risk_amount
        )
        
    except Exception as e:
        logger.error(f"Error calculating position size: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate position size: {str(e)}")


@router.post("/portfolio-risk", response_model=PortfolioRiskResponse)
async def assess_portfolio_risk(
    request: PortfolioRiskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assess overall portfolio risk.
    
    Args:
        request: Portfolio holdings and risk parameters
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        PortfolioRiskResponse with risk assessment
    """
    try:
        # Convert risk level
        risk_level_map = {
            "conservative": CalculatorRiskLevel.CONSERVATIVE,
            "moderate": CalculatorRiskLevel.MODERATE,
            "aggressive": CalculatorRiskLevel.AGGRESSIVE
        }
        
        calculator_risk_level = risk_level_map.get(request.risk_level.lower())
        if not calculator_risk_level:
            raise HTTPException(status_code=400, detail="Invalid risk level")
        
        # Create risk calculator
        risk_calculator = RiskCalculator()
        
        # Assess portfolio risk
        result = risk_calculator.assess_portfolio_risk(
            holdings=request.holdings,
            portfolio_value=request.portfolio_value,
            risk_level=calculator_risk_level
        )
        
        # Save to database
        portfolio_assessment = PortfolioRiskAssessment(
            user_id=current_user.id,
            holdings=request.holdings,
            portfolio_value=request.portfolio_value,
            risk_level=RiskLevel(request.risk_level.lower()),
            portfolio_risk_score=result.portfolio_risk_score,
            max_drawdown=result.max_drawdown,
            sharpe_ratio=result.sharpe_ratio,
            portfolio_beta=result.beta,
            correlation_risk=result.correlation_risk,
            concentration_risk=result.concentration_risk,
            recommendations=result.recommendations
        )
        db.add(portfolio_assessment)
        db.commit()
        
        return PortfolioRiskResponse(
            total_portfolio_value=result.total_portfolio_value,
            portfolio_risk_score=result.portfolio_risk_score,
            max_drawdown=result.max_drawdown,
            sharpe_ratio=result.sharpe_ratio,
            beta=result.beta,
            correlation_risk=result.correlation_risk,
            concentration_risk=result.concentration_risk,
            recommendations=result.recommendations
        )
        
    except Exception as e:
        logger.error(f"Error assessing portfolio risk: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to assess portfolio risk: {str(e)}")


@router.get("/", response_model=AnalysisListResponse)
async def list_analyses(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    symbol: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List user's stock analyses with optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        symbol: Filter by stock symbol
        status: Filter by analysis status
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        AnalysisListResponse with list of analyses
    """
    try:
        query = db.query(StockAnalysis).filter(StockAnalysis.user_id == current_user.id)
        
        if symbol:
            query = query.filter(StockAnalysis.symbol.ilike(f"%{symbol.upper()}%"))
        
        if status:
            query = query.filter(StockAnalysis.status == AnalysisStatus(status.lower()))
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        analyses = query.order_by(StockAnalysis.analysis_date.desc()).offset(skip).limit(limit).all()
        
        analysis_list = []
        for analysis in analyses:
            analysis_list.append({
                "id": str(analysis.id),
                "symbol": analysis.symbol,
                "status": analysis.status.value,
                "overall_score": analysis.overall_score,
                "recommendation": analysis.recommendation.value if analysis.recommendation else None,
                "analysis_date": analysis.analysis_date,
                "risk_level": analysis.risk_level.value
            })
        
        return AnalysisListResponse(
            analyses=analysis_list,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Error listing analyses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list analyses: {str(e)}")


async def run_stock_analysis(
    analysis_id: str,
    symbol: str,
    risk_level: AnalyzerRiskLevel,
    timeframe: str,
    db: Session
):
    """
    Background task to run stock analysis.
    
    Args:
        analysis_id: Analysis ID
        symbol: Stock symbol
        risk_level: Risk level for analysis
        timeframe: Analysis timeframe
        db: Database session
    """
    try:
        # Create analyzer
        analyzer = StockAnalyzer(db)
        
        # Run analysis
        result = await analyzer.analyze_stock(symbol, risk_level)
        
        # Update analysis record
        analysis = db.query(StockAnalysis).filter(StockAnalysis.id == analysis_id).first()
        if analysis:
            analysis.technical_score = result.technical_score
            analysis.fundamental_score = result.fundamental_score
            analysis.risk_score = result.risk_score
            analysis.overall_score = result.overall_score
            analysis.recommendation = Recommendation(result.recommendation.value)
            analysis.confidence = result.confidence
            analysis.key_metrics = result.key_metrics
            analysis.status = AnalysisStatus.COMPLETED
            analysis.last_updated = datetime.now()
            
            db.commit()
            
            logger.info(f"Analysis completed for {symbol}: {result.recommendation.value}")
        
    except Exception as e:
        logger.error(f"Error in background analysis for {symbol}: {str(e)}")
        
        # Update analysis record with error
        analysis = db.query(StockAnalysis).filter(StockAnalysis.id == analysis_id).first()
        if analysis:
            analysis.status = AnalysisStatus.FAILED
            analysis.error_message = str(e)
            analysis.last_updated = datetime.now()
            db.commit()
