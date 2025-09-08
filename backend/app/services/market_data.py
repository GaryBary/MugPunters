import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import yfinance as yf
import pandas as pd
from functools import lru_cache
import time
from app.core.config import settings

logger = logging.getLogger(__name__)


class MarketDataService:
    """
    Service for fetching ASX stock data from Yahoo Finance API.
    Includes caching, rate limiting, and error handling.
    """
    
    def __init__(self):
        self.cache_duration = 300  # 5 minutes in seconds
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_request_time = 0
        self.min_request_interval = 1  # Minimum 1 second between requests
        
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid."""
        if cache_key not in self._cache:
            return False
        
        cache_time = self._cache[cache_key].get('timestamp', 0)
        return time.time() - cache_time < self.cache_duration
    
    def _get_from_cache(self, cache_key: str) -> Optional[Any]:
        """Retrieve data from cache if valid."""
        if self._is_cache_valid(cache_key):
            logger.debug(f"Cache hit for key: {cache_key}")
            return self._cache[cache_key]['data']
        return None
    
    def _set_cache(self, cache_key: str, data: Any) -> None:
        """Store data in cache with timestamp."""
        self._cache[cache_key] = {
            'data': data,
            'timestamp': time.time()
        }
        logger.debug(f"Cached data for key: {cache_key}")
    
    async def _rate_limit(self) -> None:
        """Implement rate limiting to avoid API limits."""
        current_time = time.time()
        time_since_last_request = current_time - self._last_request_time
        
        if time_since_last_request < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last_request
            logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            await asyncio.sleep(sleep_time)
        
        self._last_request_time = time.time()
    
    def _format_asx_symbol(self, symbol: str) -> str:
        """Format symbol for ASX (add .AX suffix if not present)."""
        symbol = symbol.upper().strip()
        if not symbol.endswith('.AX'):
            symbol += '.AX'
        return symbol
    
    async def get_stock_price(self, symbol: str) -> Dict[str, Any]:
        """
        Get current stock price and basic info for an ASX stock.
        
        Args:
            symbol: Stock symbol (e.g., 'CBA', 'CBA.AX')
            
        Returns:
            Dict containing current price, change, volume, etc.
        """
        try:
            formatted_symbol = self._format_asx_symbol(symbol)
            cache_key = f"price_{formatted_symbol}"
            
            # Check cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                return cached_data
            
            await self._rate_limit()
            
            # Fetch from Yahoo Finance
            ticker = yf.Ticker(formatted_symbol)
            info = ticker.info
            
            # Get current price data
            hist = ticker.history(period="1d", interval="1m")
            
            if hist.empty:
                raise ValueError(f"No data found for symbol: {formatted_symbol}")
            
            current_price = hist['Close'].iloc[-1]
            previous_close = info.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close else 0
            
            price_data = {
                'symbol': formatted_symbol,
                'current_price': float(current_price),
                'previous_close': float(previous_close),
                'change': float(change),
                'change_percent': float(change_percent),
                'volume': int(hist['Volume'].iloc[-1]) if not hist.empty else 0,
                'high': float(hist['High'].iloc[-1]) if not hist.empty else None,
                'low': float(hist['Low'].iloc[-1]) if not hist.empty else None,
                'open': float(hist['Open'].iloc[-1]) if not hist.empty else None,
                'timestamp': datetime.now().isoformat(),
                'market_cap': info.get('marketCap'),
                'currency': info.get('currency', 'AUD')
            }
            
            # Cache the result
            self._set_cache(cache_key, price_data)
            
            logger.info(f"Successfully fetched price data for {formatted_symbol}")
            return price_data
            
        except Exception as e:
            logger.error(f"Error fetching stock price for {symbol}: {str(e)}")
            raise Exception(f"Failed to fetch stock price: {str(e)}")
    
    async def get_stock_info(self, symbol: str) -> Dict[str, Any]:
        """
        Get detailed stock information for an ASX stock.
        
        Args:
            symbol: Stock symbol (e.g., 'CBA', 'CBA.AX')
            
        Returns:
            Dict containing company info, financials, etc.
        """
        try:
            formatted_symbol = self._format_asx_symbol(symbol)
            cache_key = f"info_{formatted_symbol}"
            
            # Check cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                return cached_data
            
            await self._rate_limit()
            
            # Fetch from Yahoo Finance
            ticker = yf.Ticker(formatted_symbol)
            info = ticker.info
            
            if not info or 'symbol' not in info:
                raise ValueError(f"No information found for symbol: {formatted_symbol}")
            
            # Extract relevant information
            stock_info = {
                'symbol': formatted_symbol,
                'name': info.get('longName', info.get('shortName', '')),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', ''),
                'description': info.get('longBusinessSummary', ''),
                'website': info.get('website', ''),
                'employees': info.get('fullTimeEmployees'),
                'market_cap': info.get('marketCap'),
                'enterprise_value': info.get('enterpriseValue'),
                'trailing_pe': info.get('trailingPE'),
                'forward_pe': info.get('forwardPE'),
                'peg_ratio': info.get('pegRatio'),
                'price_to_book': info.get('priceToBook'),
                'dividend_yield': info.get('dividendYield'),
                'dividend_rate': info.get('dividendRate'),
                'payout_ratio': info.get('payoutRatio'),
                'beta': info.get('beta'),
                '52_week_high': info.get('fiftyTwoWeekHigh'),
                '52_week_low': info.get('fiftyTwoWeekLow'),
                'currency': info.get('currency', 'AUD'),
                'exchange': info.get('exchange', 'ASX'),
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache the result
            self._set_cache(cache_key, stock_info)
            
            logger.info(f"Successfully fetched stock info for {formatted_symbol}")
            return stock_info
            
        except Exception as e:
            logger.error(f"Error fetching stock info for {symbol}: {str(e)}")
            raise Exception(f"Failed to fetch stock info: {str(e)}")
    
    async def get_historical_data(
        self, 
        symbol: str, 
        period: str = "1y", 
        interval: str = "1d"
    ) -> Dict[str, Any]:
        """
        Get historical price data for an ASX stock.
        
        Args:
            symbol: Stock symbol (e.g., 'CBA', 'CBA.AX')
            period: Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
            
        Returns:
            Dict containing historical OHLCV data
        """
        try:
            formatted_symbol = self._format_asx_symbol(symbol)
            cache_key = f"historical_{formatted_symbol}_{period}_{interval}"
            
            # Check cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                return cached_data
            
            await self._rate_limit()
            
            # Fetch from Yahoo Finance
            ticker = yf.Ticker(formatted_symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                raise ValueError(f"No historical data found for symbol: {formatted_symbol}")
            
            # Convert to list of dictionaries for JSON serialization
            historical_data = []
            for date, row in hist.iterrows():
                historical_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'datetime': date.isoformat(),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume']),
                    'adj_close': float(row['Adj Close']) if 'Adj Close' in row else float(row['Close'])
                })
            
            result = {
                'symbol': formatted_symbol,
                'period': period,
                'interval': interval,
                'data': historical_data,
                'count': len(historical_data),
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache the result
            self._set_cache(cache_key, result)
            
            logger.info(f"Successfully fetched {len(historical_data)} historical data points for {formatted_symbol}")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            raise Exception(f"Failed to fetch historical data: {str(e)}")
    
    async def search_stocks(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for ASX stocks by name or symbol.
        
        Args:
            query: Search query (company name or symbol)
            limit: Maximum number of results
            
        Returns:
            List of matching stocks with basic info
        """
        try:
            cache_key = f"search_{query}_{limit}"
            
            # Check cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                return cached_data
            
            await self._rate_limit()
            
            # For now, we'll use a simple approach with common ASX stocks
            # In a production system, you might want to use a dedicated search API
            common_asx_stocks = [
                {'symbol': 'CBA.AX', 'name': 'Commonwealth Bank of Australia'},
                {'symbol': 'ANZ.AX', 'name': 'Australia and New Zealand Banking Group'},
                {'symbol': 'WBC.AX', 'name': 'Westpac Banking Corporation'},
                {'symbol': 'NAB.AX', 'name': 'National Australia Bank'},
                {'symbol': 'BHP.AX', 'name': 'BHP Group Limited'},
                {'symbol': 'RIO.AX', 'name': 'Rio Tinto Group'},
                {'symbol': 'CSL.AX', 'name': 'CSL Limited'},
                {'symbol': 'WOW.AX', 'name': 'Woolworths Group Limited'},
                {'symbol': 'WES.AX', 'name': 'Wesfarmers Limited'},
                {'symbol': 'TLS.AX', 'name': 'Telstra Group Limited'},
                {'symbol': 'FMG.AX', 'name': 'Fortescue Metals Group Limited'},
                {'symbol': 'TCL.AX', 'name': 'Transurban Group'},
                {'symbol': 'STO.AX', 'name': 'Santos Limited'},
                {'symbol': 'QAN.AX', 'name': 'Qantas Airways Limited'},
                {'symbol': 'WPL.AX', 'name': 'Woodside Energy Group Limited'}
            ]
            
            # Simple search logic
            query_lower = query.lower()
            results = []
            
            for stock in common_asx_stocks:
                if (query_lower in stock['symbol'].lower() or 
                    query_lower in stock['name'].lower()):
                    results.append(stock)
                    if len(results) >= limit:
                        break
            
            # Cache the result
            self._set_cache(cache_key, results)
            
            logger.info(f"Found {len(results)} stocks matching query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error searching stocks for query {query}: {str(e)}")
            raise Exception(f"Failed to search stocks: {str(e)}")
    
    def clear_cache(self) -> None:
        """Clear all cached data."""
        self._cache.clear()
        logger.info("Market data cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        current_time = time.time()
        valid_entries = sum(1 for data in self._cache.values() 
                          if current_time - data['timestamp'] < self.cache_duration)
        
        return {
            'total_entries': len(self._cache),
            'valid_entries': valid_entries,
            'expired_entries': len(self._cache) - valid_entries,
            'cache_duration_seconds': self.cache_duration
        }


# Global instance
market_data_service = MarketDataService()
