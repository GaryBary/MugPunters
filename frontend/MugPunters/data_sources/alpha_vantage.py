"""
Alpha Vantage API integration for ASX market data
"""
import asyncio
import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class AlphaVantageClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"
        self.session = httpx.AsyncClient(timeout=30.0)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.aclose()
    
    async def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get real-time quote for ASX stock
        """
        try:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": f"{symbol}.AX",  # ASX suffix
                "apikey": self.api_key
            }
            
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "Global Quote" in data:
                quote = data["Global Quote"]
                return {
                    "symbol": symbol,
                    "price": float(quote.get("05. price", 0)),
                    "change": float(quote.get("09. change", 0)),
                    "change_percent": float(quote.get("10. change percent", "0%").replace("%", "")),
                    "volume": int(quote.get("06. volume", 0)),
                    "high": float(quote.get("03. high", 0)),
                    "low": float(quote.get("04. low", 0)),
                    "open": float(quote.get("02. open", 0)),
                    "previous_close": float(quote.get("08. previous close", 0)),
                    "timestamp": datetime.now().isoformat()
                }
            return None
            
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
            return None
    
    async def get_company_overview(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get company overview and fundamental data
        """
        try:
            params = {
                "function": "OVERVIEW",
                "symbol": f"{symbol}.AX",
                "apikey": self.api_key
            }
            
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "Symbol" in data:
                return {
                    "symbol": symbol,
                    "name": data.get("Name", ""),
                    "sector": data.get("Sector", ""),
                    "industry": data.get("Industry", ""),
                    "market_cap": self._parse_numeric(data.get("MarketCapitalization")),
                    "pe_ratio": self._parse_numeric(data.get("PERatio")),
                    "pb_ratio": self._parse_numeric(data.get("PriceToBookRatio")),
                    "dividend_yield": self._parse_numeric(data.get("DividendYield")),
                    "eps": self._parse_numeric(data.get("EPS")),
                    "revenue_ttm": self._parse_numeric(data.get("RevenueTTM")),
                    "profit_margin": self._parse_numeric(data.get("ProfitMargin")),
                    "return_on_equity": self._parse_numeric(data.get("ReturnOnEquityTTM")),
                    "debt_to_equity": self._parse_numeric(data.get("DebtToEquity")),
                    "current_ratio": self._parse_numeric(data.get("CurrentRatio")),
                    "description": data.get("Description", ""),
                    "website": data.get("Website", ""),
                    "last_updated": datetime.now().isoformat()
                }
            return None
            
        except Exception as e:
            logger.error(f"Error fetching company overview for {symbol}: {e}")
            return None
    
    async def get_historical_data(
        self, 
        symbol: str, 
        interval: str = "daily",
        outputsize: str = "compact"
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get historical price data
        """
        try:
            function_map = {
                "daily": "TIME_SERIES_DAILY",
                "weekly": "TIME_SERIES_WEEKLY",
                "monthly": "TIME_SERIES_MONTHLY"
            }
            
            params = {
                "function": function_map.get(interval, "TIME_SERIES_DAILY"),
                "symbol": f"{symbol}.AX",
                "outputsize": outputsize,
                "apikey": self.api_key
            }
            
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            time_series_key = f"Time Series ({interval.title()})"
            if time_series_key in data:
                historical_data = []
                for date_str, values in data[time_series_key].items():
                    historical_data.append({
                        "symbol": symbol,
                        "date": date_str,
                        "open": float(values.get("1. open", 0)),
                        "high": float(values.get("2. high", 0)),
                        "low": float(values.get("3. low", 0)),
                        "close": float(values.get("4. close", 0)),
                        "volume": int(values.get("5. volume", 0)),
                        "adjusted_close": float(values.get("4. close", 0))  # Alpha Vantage doesn't provide adjusted close
                    })
                
                # Sort by date
                historical_data.sort(key=lambda x: x["date"])
                return historical_data
            return None
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return None
    
    async def get_technical_indicators(
        self, 
        symbol: str, 
        function: str = "SMA",
        interval: str = "daily",
        time_period: int = 20
    ) -> Optional[Dict[str, Any]]:
        """
        Get technical indicators (SMA, EMA, RSI, MACD, etc.)
        """
        try:
            params = {
                "function": function,
                "symbol": f"{symbol}.AX",
                "interval": interval,
                "time_period": time_period,
                "series_type": "close",
                "apikey": self.api_key
            }
            
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Parse technical indicator data
            meta_key = f"Meta Data"
            if meta_key in data:
                meta = data[meta_key]
                indicator_key = f"Technical Analysis: {function}"
                
                if indicator_key in data:
                    latest_date = max(data[indicator_key].keys())
                    latest_value = data[indicator_key][latest_date]
                    
                    return {
                        "symbol": symbol,
                        "indicator": function,
                        "value": float(latest_value.get(function, 0)),
                        "date": latest_date,
                        "interval": interval,
                        "time_period": time_period
                    }
            return None
            
        except Exception as e:
            logger.error(f"Error fetching technical indicators for {symbol}: {e}")
            return None
    
    def _parse_numeric(self, value: str) -> Optional[float]:
        """Parse numeric string values from API"""
        if not value or value == "None":
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None


# ASX-specific helper functions
class ASXDataProvider:
    def __init__(self, api_key: str):
        self.client = AlphaVantageClient(api_key)
    
    async def get_asx_200_stocks(self) -> List[str]:
        """
        Get list of ASX 200 stock symbols
        Note: This would typically come from a static list or another data source
        """
        # Common ASX 200 stocks - in production, this would be from a database or API
        return [
            "CBA", "BHP", "WBC", "ANZ", "NAB", "CSL", "WES", "TLS", "RIO", "FMG",
            "WOW", "TCL", "STO", "QBE", "SUN", "AMC", "WPL", "BXB", "SCG", "IAG",
            "GMG", "ALL", "S32", "ORG", "JHX", "DOW", "RHC", "ASX", "TWE", "NCM"
        ]
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """
        Get ASX market overview
        """
        async with self.client as client:
            # Get ASX 200 index data
            asx_200_data = await client.get_quote("XJO")  # ASX 200 index
            
            # Get top movers (simplified - would need more sophisticated logic)
            top_stocks = await self.get_asx_200_stocks()
            stock_quotes = []
            
            for symbol in top_stocks[:20]:  # Limit to first 20 for performance
                quote = await client.get_quote(symbol)
                if quote:
                    stock_quotes.append(quote)
            
            # Sort by change percentage
            top_gainers = sorted(stock_quotes, key=lambda x: x["change_percent"], reverse=True)[:5]
            top_losers = sorted(stock_quotes, key=lambda x: x["change_percent"])[:5]
            most_active = sorted(stock_quotes, key=lambda x: x["volume"], reverse=True)[:5]
            
            return {
                "asx_200": asx_200_data or {"value": 0, "change": 0, "change_percent": 0},
                "top_gainers": top_gainers,
                "top_losers": top_losers,
                "most_active": most_active,
                "last_updated": datetime.now().isoformat()
            }
