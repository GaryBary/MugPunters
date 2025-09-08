import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Settings,
  Maximize2,
  Download
} from 'lucide-react';

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
}

interface StockChartProps {
  symbol?: string;
  data?: PriceData[];
  height?: number;
  showIndicators?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({ 
  symbol = 'BHP', 
  data: propData,
  height = 400,
  showIndicators = true 
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y'>('1M');
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'area'>('line');
  const [showVolume, setShowVolume] = useState(true);

  // Generate mock data if not provided
  const data: PriceData[] = useMemo(() => {
    if (propData) return propData;
    
    const generateMockData = () => {
      const result: PriceData[] = [];
      const basePrice = 45.67;
      let currentPrice = basePrice;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 30 days of data
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Generate realistic price movement
        const change = (Math.random() - 0.5) * 2; // -1 to +1
        const volatility = 0.02; // 2% volatility
        currentPrice = currentPrice * (1 + change * volatility);
        
        const open = currentPrice;
        const close = open * (1 + (Math.random() - 0.5) * 0.03);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        
        // Generate technical indicators
        const rsi = 30 + Math.random() * 40; // RSI between 30-70
        const macd = (Math.random() - 0.5) * 2;
        const macdSignal = macd * (0.8 + Math.random() * 0.4);
        const macdHistogram = macd - macdSignal;
        
        // Moving averages
        const sma20 = currentPrice * (0.95 + Math.random() * 0.1);
        const sma50 = currentPrice * (0.9 + Math.random() * 0.2);
        const ema12 = currentPrice * (0.98 + Math.random() * 0.04);
        const ema26 = currentPrice * (0.96 + Math.random() * 0.08);
        
        result.push({
          date: date.toISOString().split('T')[0],
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          rsi: Number(rsi.toFixed(1)),
          macd: Number(macd.toFixed(3)),
          macdSignal: Number(macdSignal.toFixed(3)),
          macdHistogram: Number(macdHistogram.toFixed(3)),
          sma20: Number(sma20.toFixed(2)),
          sma50: Number(sma50.toFixed(2)),
          ema12: Number(ema12.toFixed(2)),
          ema26: Number(ema26.toFixed(2))
        });
        
        currentPrice = close;
      }
      
      return result;
    };
    
    return generateMockData();
  }, [propData]);

  const currentPrice = data[data.length - 1]?.close || 0;
  const previousPrice = data[data.length - 2]?.close || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'close':
      case 'open':
      case 'high':
      case 'low':
      case 'sma20':
      case 'sma50':
      case 'ema12':
      case 'ema26':
        return [`$${value.toFixed(2)}`, name.toUpperCase()];
      case 'volume':
        return [`${(value / 1000000).toFixed(1)}M`, 'Volume'];
      case 'rsi':
        return [`${value.toFixed(1)}`, 'RSI'];
      case 'macd':
      case 'macdSignal':
      case 'macdHistogram':
        return [`${value.toFixed(3)}`, name.toUpperCase()];
      default:
        return [value, name];
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const [value, name] = formatTooltipValue(entry.value, entry.dataKey);
            return (
              <p key={index} className="text-white text-sm" style={{ color: entry.color }}>
                {name}: {value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderMainChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        );
      
      case 'candlestick':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="high"
              stroke="#22c55e"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#ef4444"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        );
    }
  };

  const renderVolumeChart = () => (
    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis 
        dataKey="date" 
        stroke="#9ca3af"
        fontSize={12}
        tickFormatter={(value) => new Date(value).toLocaleDateString()}
      />
      <YAxis 
        stroke="#9ca3af"
        fontSize={12}
        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="volume" fill="#6b7280" />
    </BarChart>
  );

  const renderRSIChart = () => (
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis 
        dataKey="date" 
        stroke="#9ca3af"
        fontSize={12}
        tickFormatter={(value) => new Date(value).toLocaleDateString()}
      />
      <YAxis 
        stroke="#9ca3af"
        fontSize={12}
        domain={[0, 100]}
      />
      <Tooltip content={<CustomTooltip />} />
      <Line
        type="monotone"
        dataKey="rsi"
        stroke="#8b5cf6"
        strokeWidth={2}
        dot={false}
      />
      <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
      <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" />
    </LineChart>
  );

  const renderMACDChart = () => (
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis 
        dataKey="date" 
        stroke="#9ca3af"
        fontSize={12}
        tickFormatter={(value) => new Date(value).toLocaleDateString()}
      />
      <YAxis 
        stroke="#9ca3af"
        fontSize={12}
      />
      <Tooltip content={<CustomTooltip />} />
      <Line
        type="monotone"
        dataKey="macd"
        stroke="#3b82f6"
        strokeWidth={2}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="macdSignal"
        stroke="#f59e0b"
        strokeWidth={2}
        dot={false}
      />
      <Bar dataKey="macdHistogram" fill="#6b7280" />
    </LineChart>
  );

  return (
    <div className="bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{symbol} Stock Analysis</h2>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</span>
              <div className={`flex items-center ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? (
                  <TrendingUp className="h-5 w-5 mr-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 mr-1" />
                )}
                <span className="font-semibold">
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button className="btn-secondary flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="btn-secondary flex items-center">
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="input-field w-auto"
                >
                  <option value="1D">1 Day</option>
                  <option value="1W">1 Week</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="input-field w-auto"
                >
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                  <option value="candlestick">Candlestick</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showVolume}
                  onChange={(e) => setShowVolume(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Show Volume</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showIndicators}
                  onChange={(e) => setShowIndicators(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Show Indicators</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Price Chart */}
        <div className="card mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Price Chart</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
                <span>Close Price</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-yellow-500 mr-2" style={{borderStyle: 'dashed'}}></div>
                <span>SMA 20</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-red-500 mr-2" style={{borderStyle: 'dashed'}}></div>
                <span>SMA 50</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={height}>
            {renderMainChart()}
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        {showVolume && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Volume</h3>
            <ResponsiveContainer width="100%" height={150}>
              {renderVolumeChart()}
            </ResponsiveContainer>
          </div>
        )}

        {/* Technical Indicators */}
        {showIndicators && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">RSI (Relative Strength Index)</h3>
              <ResponsiveContainer width="100%" height={200}>
                {renderRSIChart()}
              </ResponsiveContainer>
              <div className="mt-2 text-sm text-gray-400">
                <span className="text-red-400">Overbought (70+)</span> • 
                <span className="text-green-400"> Oversold (30-)</span>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">MACD (Moving Average Convergence Divergence)</h3>
              <ResponsiveContainer width="100%" height={200}>
                {renderMACDChart()}
              </ResponsiveContainer>
              <div className="mt-2 text-sm text-gray-400">
                <span className="text-blue-400">MACD Line</span> • 
                <span className="text-yellow-400"> Signal Line</span> • 
                <span className="text-gray-400"> Histogram</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;
