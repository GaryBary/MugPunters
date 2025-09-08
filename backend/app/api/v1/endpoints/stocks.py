from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.core.database import get_db
from app.services.market_data import market_data_service
from app.services.technical_analysis import technical_analysis_service
from app.models.stock import Stock, StockData, TechnicalAnalysis, HistoricalData

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def get_stocks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve stocks from database.
    """
    try:
        result = await db.execute(
            select(Stock).offset(skip).limit(limit)
        )
        stocks = result.scalars().all()
        
        return {
            "stocks": [
                {
                    "id": str(stock.id),
                    "symbol": stock.symbol,
                    "name": stock.name,
                    "exchange": stock.exchange,
                    "sector": stock.sector,
                    "industry": stock.industry,
                    "current_price": stock.current_price,
                    "market_cap": stock.market_cap,
                    "currency": stock.currency,
                    "last_updated": stock.last_updated.isoformat() if stock.last_updated else None
                }
                for stock in stocks
            ],
            "total": len(stocks),
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error retrieving stocks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve stocks")


@router.get("/search")
async def search_stocks(
    query: str = Query(..., description="Search query for stock symbol or name"),
    limit: int = Query(10, description="Maximum number of results"),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Search for stocks by symbol or name.
    """
    try:
        # Use the market data service for search
        results = await market_data_service.search_stocks(query, limit)
        
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Error searching stocks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search stocks")


@router.get("/{symbol}/current")
async def get_stock_current_price(
    symbol: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get current stock price and basic info.
    """
    try:
        # Fetch current price data from market data service
        price_data = await market_data_service.get_stock_price(symbol)
        
        return {
            "success": True,
            "data": price_data
        }
    except Exception as e:
        logger.error(f"Error fetching current price for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch current price: {str(e)}")


@router.get("/{symbol}/info")
async def get_stock_info(
    symbol: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get detailed stock information.
    """
    try:
        # Fetch stock info from market data service
        stock_info = await market_data_service.get_stock_info(symbol)
        
        return {
            "success": True,
            "data": stock_info
        }
    except Exception as e:
        logger.error(f"Error fetching stock info for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock info: {str(e)}")


@router.get("/{symbol}/historical")
async def get_stock_historical(
    symbol: str,
    period: str = Query("1y", description="Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)"),
    interval: str = Query("1d", description="Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)"),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get historical data for a stock.
    """
    try:
        # Fetch historical data from market data service
        historical_data = await market_data_service.get_historical_data(symbol, period, interval)
        
        return {
            "success": True,
            "data": historical_data
        }
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch historical data: {str(e)}")


@router.get("/{symbol}/analysis")
async def get_stock_analysis(
    symbol: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get technical analysis for a stock.
    """
    try:
        # First get historical data for analysis
        historical_data = await market_data_service.get_historical_data(symbol, "1y", "1d")
        
        if not historical_data.get('data'):
            raise HTTPException(status_code=404, detail="No historical data available for analysis")
        
        # Extract price data
        prices = [item['close'] for item in historical_data['data']]
        highs = [item['high'] for item in historical_data['data']]
        lows = [item['low'] for item in historical_data['data']]
        
        # Calculate technical indicators
        indicators = technical_analysis_service.calculate_all_indicators(prices, highs, lows)
        
        # Generate signal summary
        signals = technical_analysis_service.get_signal_summary(indicators)
        
        return {
            "success": True,
            "symbol": symbol,
            "indicators": indicators,
            "signals": signals,
            "data_points": len(prices),
            "analysis_date": historical_data.get('timestamp')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing technical analysis for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to perform technical analysis: {str(e)}")


@router.get("/{symbol}")
async def get_stock(
    symbol: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get comprehensive stock data including current price, info, and basic analysis.
    """
    try:
        # Fetch all data in parallel
        price_data = await market_data_service.get_stock_price(symbol)
        stock_info = await market_data_service.get_stock_info(symbol)
        
        # Get basic technical analysis (last 30 days)
        historical_data = await market_data_service.get_historical_data(symbol, "1mo", "1d")
        
        indicators = {}
        signals = {}
        
        if historical_data.get('data'):
            prices = [item['close'] for item in historical_data['data']]
            indicators = technical_analysis_service.calculate_all_indicators(prices)
            signals = technical_analysis_service.get_signal_summary(indicators)
        
        return {
            "success": True,
            "symbol": symbol,
            "price_data": price_data,
            "stock_info": stock_info,
            "technical_analysis": {
                "indicators": indicators,
                "signals": signals
            },
            "last_updated": price_data.get('timestamp')
        }
    except Exception as e:
        logger.error(f"Error fetching comprehensive stock data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stock data: {str(e)}")
