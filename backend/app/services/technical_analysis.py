import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class TechnicalAnalysisService:
    """
    Service for calculating technical indicators from price data.
    Uses pandas for efficient calculations.
    """
    
    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> List[Optional[float]]:
        """
        Calculate Relative Strength Index (RSI).
        
        Args:
            prices: List of closing prices
            period: RSI period (default 14)
            
        Returns:
            List of RSI values (None for insufficient data)
        """
        try:
            if len(prices) < period + 1:
                logger.warning(f"Insufficient data for RSI calculation. Need {period + 1}, got {len(prices)}")
                return [None] * len(prices)
            
            df = pd.DataFrame({'close': prices})
            
            # Calculate price changes
            delta = df['close'].diff()
            
            # Separate gains and losses
            gains = delta.where(delta > 0, 0)
            losses = -delta.where(delta < 0, 0)
            
            # Calculate average gains and losses using exponential moving average
            avg_gains = gains.ewm(span=period, adjust=False).mean()
            avg_losses = losses.ewm(span=period, adjust=False).mean()
            
            # Calculate RS and RSI
            rs = avg_gains / avg_losses
            rsi = 100 - (100 / (1 + rs))
            
            # Convert to list, replacing NaN with None
            rsi_values = rsi.tolist()
            return [None if pd.isna(val) else round(float(val), 2) for val in rsi_values]
            
        except Exception as e:
            logger.error(f"Error calculating RSI: {str(e)}")
            return [None] * len(prices)
    
    @staticmethod
    def calculate_macd(
        prices: List[float], 
        fast_period: int = 12, 
        slow_period: int = 26, 
        signal_period: int = 9
    ) -> Dict[str, List[Optional[float]]]:
        """
        Calculate MACD (Moving Average Convergence Divergence).
        
        Args:
            prices: List of closing prices
            fast_period: Fast EMA period (default 12)
            slow_period: Slow EMA period (default 26)
            signal_period: Signal line EMA period (default 9)
            
        Returns:
            Dict with 'macd', 'signal', and 'histogram' lists
        """
        try:
            if len(prices) < slow_period:
                logger.warning(f"Insufficient data for MACD calculation. Need {slow_period}, got {len(prices)}")
                empty_list = [None] * len(prices)
                return {'macd': empty_list, 'signal': empty_list, 'histogram': empty_list}
            
            df = pd.DataFrame({'close': prices})
            
            # Calculate EMAs
            ema_fast = df['close'].ewm(span=fast_period, adjust=False).mean()
            ema_slow = df['close'].ewm(span=slow_period, adjust=False).mean()
            
            # Calculate MACD line
            macd_line = ema_fast - ema_slow
            
            # Calculate signal line
            signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
            
            # Calculate histogram
            histogram = macd_line - signal_line
            
            # Convert to lists, replacing NaN with None
            def clean_values(series):
                return [None if pd.isna(val) else round(float(val), 4) for val in series.tolist()]
            
            return {
                'macd': clean_values(macd_line),
                'signal': clean_values(signal_line),
                'histogram': clean_values(histogram)
            }
            
        except Exception as e:
            logger.error(f"Error calculating MACD: {str(e)}")
            empty_list = [None] * len(prices)
            return {'macd': empty_list, 'signal': empty_list, 'histogram': empty_list}
    
    @staticmethod
    def calculate_moving_averages(
        prices: List[float], 
        periods: List[int] = [5, 10, 20, 50, 200]
    ) -> Dict[str, List[Optional[float]]]:
        """
        Calculate Simple Moving Averages (SMA).
        
        Args:
            prices: List of closing prices
            periods: List of periods for moving averages
            
        Returns:
            Dict with moving averages for each period
        """
        try:
            if not prices:
                return {}
            
            df = pd.DataFrame({'close': prices})
            result = {}
            
            for period in periods:
                if len(prices) < period:
                    logger.warning(f"Insufficient data for {period}-period SMA. Need {period}, got {len(prices)}")
                    result[f'sma_{period}'] = [None] * len(prices)
                else:
                    sma = df['close'].rolling(window=period).mean()
                    result[f'sma_{period}'] = [None if pd.isna(val) else round(float(val), 2) for val in sma.tolist()]
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating moving averages: {str(e)}")
            return {f'sma_{period}': [None] * len(prices) for period in periods}
    
    @staticmethod
    def calculate_exponential_moving_averages(
        prices: List[float], 
        periods: List[int] = [12, 26, 50]
    ) -> Dict[str, List[Optional[float]]]:
        """
        Calculate Exponential Moving Averages (EMA).
        
        Args:
            prices: List of closing prices
            periods: List of periods for EMAs
            
        Returns:
            Dict with EMAs for each period
        """
        try:
            if not prices:
                return {}
            
            df = pd.DataFrame({'close': prices})
            result = {}
            
            for period in periods:
                if len(prices) < period:
                    logger.warning(f"Insufficient data for {period}-period EMA. Need {period}, got {len(prices)}")
                    result[f'ema_{period}'] = [None] * len(prices)
                else:
                    ema = df['close'].ewm(span=period, adjust=False).mean()
                    result[f'ema_{period}'] = [None if pd.isna(val) else round(float(val), 2) for val in ema.tolist()]
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating exponential moving averages: {str(e)}")
            return {f'ema_{period}': [None] * len(prices) for period in periods}
    
    @staticmethod
    def calculate_bollinger_bands(
        prices: List[float], 
        period: int = 20, 
        std_dev: float = 2.0
    ) -> Dict[str, List[Optional[float]]]:
        """
        Calculate Bollinger Bands.
        
        Args:
            prices: List of closing prices
            period: Moving average period (default 20)
            std_dev: Standard deviation multiplier (default 2.0)
            
        Returns:
            Dict with 'upper', 'middle', and 'lower' bands
        """
        try:
            if len(prices) < period:
                logger.warning(f"Insufficient data for Bollinger Bands. Need {period}, got {len(prices)}")
                empty_list = [None] * len(prices)
                return {'upper': empty_list, 'middle': empty_list, 'lower': empty_list}
            
            df = pd.DataFrame({'close': prices})
            
            # Calculate middle band (SMA)
            middle_band = df['close'].rolling(window=period).mean()
            
            # Calculate standard deviation
            std = df['close'].rolling(window=period).std()
            
            # Calculate upper and lower bands
            upper_band = middle_band + (std * std_dev)
            lower_band = middle_band - (std * std_dev)
            
            def clean_values(series):
                return [None if pd.isna(val) else round(float(val), 2) for val in series.tolist()]
            
            return {
                'upper': clean_values(upper_band),
                'middle': clean_values(middle_band),
                'lower': clean_values(lower_band)
            }
            
        except Exception as e:
            logger.error(f"Error calculating Bollinger Bands: {str(e)}")
            empty_list = [None] * len(prices)
            return {'upper': empty_list, 'middle': empty_list, 'lower': empty_list}
    
    @staticmethod
    def calculate_stochastic(
        high: List[float], 
        low: List[float], 
        close: List[float], 
        k_period: int = 14, 
        d_period: int = 3
    ) -> Dict[str, List[Optional[float]]]:
        """
        Calculate Stochastic Oscillator.
        
        Args:
            high: List of high prices
            low: List of low prices
            close: List of closing prices
            k_period: %K period (default 14)
            d_period: %D period (default 3)
            
        Returns:
            Dict with '%K' and '%D' values
        """
        try:
            if len(close) < k_period:
                logger.warning(f"Insufficient data for Stochastic. Need {k_period}, got {len(close)}")
                empty_list = [None] * len(close)
                return {'k_percent': empty_list, 'd_percent': empty_list}
            
            df = pd.DataFrame({
                'high': high,
                'low': low,
                'close': close
            })
            
            # Calculate %K
            lowest_low = df['low'].rolling(window=k_period).min()
            highest_high = df['high'].rolling(window=k_period).max()
            k_percent = 100 * ((df['close'] - lowest_low) / (highest_high - lowest_low))
            
            # Calculate %D (SMA of %K)
            d_percent = k_percent.rolling(window=d_period).mean()
            
            def clean_values(series):
                return [None if pd.isna(val) else round(float(val), 2) for val in series.tolist()]
            
            return {
                'k_percent': clean_values(k_percent),
                'd_percent': clean_values(d_percent)
            }
            
        except Exception as e:
            logger.error(f"Error calculating Stochastic: {str(e)}")
            empty_list = [None] * len(close)
            return {'k_percent': empty_list, 'd_percent': empty_list}
    
    @staticmethod
    def calculate_all_indicators(
        prices: List[float], 
        high: Optional[List[float]] = None, 
        low: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Calculate all technical indicators for given price data.
        
        Args:
            prices: List of closing prices
            high: Optional list of high prices
            low: Optional list of low prices
            
        Returns:
            Dict containing all calculated indicators
        """
        try:
            result = {
                'rsi': TechnicalAnalysisService.calculate_rsi(prices),
                'macd': TechnicalAnalysisService.calculate_macd(prices),
                'sma': TechnicalAnalysisService.calculate_moving_averages(prices),
                'ema': TechnicalAnalysisService.calculate_exponential_moving_averages(prices),
                'bollinger_bands': TechnicalAnalysisService.calculate_bollinger_bands(prices)
            }
            
            # Add stochastic if high and low prices are provided
            if high and low and len(high) == len(prices) and len(low) == len(prices):
                result['stochastic'] = TechnicalAnalysisService.calculate_stochastic(high, low, prices)
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating all indicators: {str(e)}")
            return {}
    
    @staticmethod
    def get_signal_summary(indicators: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate trading signal summary based on technical indicators.
        
        Args:
            indicators: Dict containing calculated indicators
            
        Returns:
            Dict with signal summaries for each indicator
        """
        signals = {}
        
        try:
            # RSI signals
            if 'rsi' in indicators and indicators['rsi']:
                latest_rsi = next((rsi for rsi in reversed(indicators['rsi']) if rsi is not None), None)
                if latest_rsi:
                    if latest_rsi > 70:
                        signals['rsi'] = 'Overbought'
                    elif latest_rsi < 30:
                        signals['rsi'] = 'Oversold'
                    else:
                        signals['rsi'] = 'Neutral'
            
            # MACD signals
            if 'macd' in indicators and indicators['macd'].get('macd') and indicators['macd'].get('signal'):
                macd_line = indicators['macd']['macd']
                signal_line = indicators['macd']['signal']
                
                latest_macd = next((m for m in reversed(macd_line) if m is not None), None)
                latest_signal = next((s for s in reversed(signal_line) if s is not None), None)
                
                if latest_macd and latest_signal:
                    if latest_macd > latest_signal:
                        signals['macd'] = 'Bullish'
                    else:
                        signals['macd'] = 'Bearish'
            
            # Moving Average signals
            if 'sma' in indicators:
                sma_20 = indicators['sma'].get('sma_20', [])
                sma_50 = indicators['sma'].get('sma_50', [])
                
                if sma_20 and sma_50:
                    latest_sma_20 = next((sma for sma in reversed(sma_20) if sma is not None), None)
                    latest_sma_50 = next((sma for sma in reversed(sma_50) if sma is not None), None)
                    
                    if latest_sma_20 and latest_sma_50:
                        if latest_sma_20 > latest_sma_50:
                            signals['moving_averages'] = 'Bullish'
                        else:
                            signals['moving_averages'] = 'Bearish'
            
            return signals
            
        except Exception as e:
            logger.error(f"Error generating signal summary: {str(e)}")
            return {}


# Global instance
technical_analysis_service = TechnicalAnalysisService()
