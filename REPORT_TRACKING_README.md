# Report Tracking and Historical Comparison System

This document describes the comprehensive report tracking and historical comparison system implemented for the Mug Punters Investment Research Platform.

## Overview

The report tracking system allows users to:
- Save analysis reports with comprehensive parameters and results
- Track performance of their analysis predictions over time
- Re-evaluate reports to compare original vs current data
- View detailed performance metrics and accuracy scores
- Filter and search through historical reports

## Components Implemented

### 1. Frontend Components

#### ReportHistory.tsx
- **Location**: `frontend/src/components/ReportHistory.tsx`
- **Features**:
  - List of past analysis reports with date/time
  - Filter by risk level and timeframe
  - "Re-evaluate" button for each report
  - Performance tracking showing actual vs predicted returns
  - Accuracy scoring and performance grading
  - Real-time performance updates
  - Responsive design with modern UI

#### ReportHistoryPage.tsx
- **Location**: `frontend/src/pages/ReportHistoryPage.tsx`
- **Features**:
  - Page wrapper for the ReportHistory component
  - Authentication check
  - Layout integration

### 2. Backend Services

#### ReportManagerService
- **Location**: `backend/app/services/report_manager.py`
- **Methods**:
  - `save_analysis_report()`: Save new analysis reports with performance tracking
  - `get_user_reports()`: Retrieve user's reports with filtering
  - `re_evaluate_report()`: Compare original vs current data
  - `calculate_report_performance()`: Generate detailed performance metrics
  - `get_performance_summary()`: Overall user performance summary

### 3. Database Models

#### AnalysisReport
- **Location**: `backend/app/models/analysis.py`
- **Fields**:
  - `id`: UUID primary key
  - `user_id`: Foreign key to users table
  - `stock_symbol`: Stock symbol being analyzed
  - `parameters`: JSON field for analysis parameters
  - `results`: JSON field for analysis results
  - `risk_level`: Risk level enum (conservative/moderate/aggressive)
  - `timeframe`: Analysis timeframe
  - `created_at`, `last_updated`: Timestamps
  - `is_active`: Boolean for soft deletion

#### ReportPerformance
- **Location**: `backend/app/models/analysis.py`
- **Fields**:
  - `id`: UUID primary key
  - `report_id`: Foreign key to analysis_reports
  - `stock_symbol`: Stock symbol
  - `original_price`, `current_price`: Price tracking
  - `performance_pct`: Actual return percentage
  - `predicted_return`: Original prediction
  - `actual_return`: Actual return amount
  - `accuracy_score`: Prediction accuracy (0-1)
  - `days_since_analysis`: Time tracking
  - `market_conditions`: JSON for market context

### 4. API Endpoints

#### Reports API
- **Location**: `backend/app/api/v1/endpoints/reports.py`
- **Endpoints**:
  - `GET /api/reports`: Get user's report history with filtering
  - `POST /api/reports`: Create new analysis report
  - `GET /api/reports/{report_id}`: Get specific report
  - `POST /api/reports/{report_id}/re-evaluate`: Re-evaluate report
  - `GET /api/reports/{report_id}/performance`: Get detailed performance metrics
  - `GET /api/reports/performance/summary`: Get overall performance summary

### 5. Frontend Services

#### ReportApiService
- **Location**: `frontend/src/services/reportApi.ts`
- **Methods**:
  - `getReports()`: Fetch reports with filtering
  - `getReport()`: Get specific report
  - `createReport()`: Create new report
  - `reEvaluateReport()`: Re-evaluate report
  - `getReportPerformance()`: Get performance metrics
  - `getPerformanceSummary()`: Get performance summary

### 6. Type Definitions

#### Frontend Types
- **Location**: `frontend/src/types/index.ts`
- **Types**:
  - `ReportPerformance`: Performance tracking data
  - `AnalysisReport`: Complete report structure
  - `ReEvaluationResponse`: Re-evaluation results
  - `PerformanceMetrics`: Detailed performance data
  - `PerformanceSummary`: Overall performance summary
  - `ReportListResponse`: Paginated report list

#### Backend Schemas
- **Location**: `backend/app/schemas/analysis.py`
- **Schemas**:
  - `ReportPerformanceResponse`: Performance tracking response
  - `AnalysisReportResponse`: Report response schema
  - `ReEvaluationResponse`: Re-evaluation response
  - `PerformanceMetricsResponse`: Performance metrics response
  - `PerformanceSummaryResponse`: Performance summary response
  - `SaveReportRequest`: Report creation request

## Key Features

### 1. Performance Tracking
- **Real-time Updates**: Current prices are fetched and compared to original analysis prices
- **Accuracy Scoring**: Calculates how accurate predictions were (0-1 scale)
- **Performance Grading**: Letter grades (A-F) based on accuracy
- **Benchmark Comparison**: Compares performance against market benchmarks

### 2. Historical Analysis
- **Time Tracking**: Days since original analysis
- **Market Conditions**: Context about market conditions at time of analysis
- **Recommendation Accuracy**: Tracks whether buy/sell/hold recommendations were correct
- **Performance Distribution**: Categorizes performance into excellent/good/neutral/poor/terrible

### 3. Filtering and Search
- **Risk Level Filter**: Filter by conservative/moderate/aggressive
- **Timeframe Filter**: Filter by analysis timeframe (6m, 1y, 2y)
- **Stock Symbol Filter**: Filter by specific stocks
- **Date Range Filter**: Filter by creation date

### 4. Re-evaluation System
- **One-click Re-evaluation**: Update performance data with current market prices
- **Comparison Metrics**: Side-by-side comparison of original vs current data
- **Accuracy Updates**: Recalculate accuracy scores based on new data
- **Performance Summary**: Generate human-readable performance summaries

## Database Schema

### Analysis Reports Table
```sql
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    stock_symbol VARCHAR(10) NOT NULL,
    parameters JSONB NOT NULL,
    results JSONB NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('conservative', 'moderate', 'aggressive')),
    timeframe VARCHAR(20) NOT NULL DEFAULT '1y',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### Report Performance Table
```sql
CREATE TABLE report_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES analysis_reports(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    performance_pct DECIMAL(8,4) NOT NULL,
    predicted_return DECIMAL(8,4),
    actual_return DECIMAL(10,2) NOT NULL,
    accuracy_score DECIMAL(3,2),
    days_since_analysis INTEGER,
    market_conditions JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### Creating a Report
```typescript
const reportData = {
  stock_symbol: 'CBA',
  risk_level: 'moderate',
  timeframe: '1y',
  parameters: {
    technical_indicators: ['RSI', 'MACD', 'SMA'],
    fundamental_metrics: ['PE', 'PB', 'ROE'],
    risk_factors: ['volatility', 'beta', 'sector']
  },
  results: {
    technical_score: 75,
    fundamental_score: 82,
    risk_score: 68,
    overall_score: 75,
    recommendation: 'buy',
    confidence: 0.78,
    target_price: 95.50,
    key_metrics: {
      pe_ratio: 15.2,
      pb_ratio: 1.8,
      dividend_yield: 4.2
    }
  }
};

const report = await reportApi.createReport(reportData);
```

### Re-evaluating a Report
```typescript
const reEvaluationResult = await reportApi.reEvaluateReport(reportId);
console.log(`Performance: ${reEvaluationResult.performance_pct}%`);
console.log(`Accuracy: ${reEvaluationResult.accuracy_score}`);
```

### Getting Performance Summary
```typescript
const summary = await reportApi.getPerformanceSummary();
console.log(`Total Reports: ${summary.total_reports}`);
console.log(`Average Accuracy: ${summary.average_accuracy}`);
console.log(`Best Performer: ${summary.best_performer?.symbol}`);
```

## Performance Metrics

### Accuracy Scoring
- **Formula**: `1.0 - abs(actual_return - predicted_return) / abs(predicted_return)`
- **Range**: 0.0 to 1.0 (0% to 100% accuracy)
- **Grading**:
  - A: 80%+ accuracy
  - B: 70-79% accuracy
  - C: 60-69% accuracy
  - D: 50-59% accuracy
  - F: <50% accuracy

### Performance Categories
- **Excellent**: >10% return
- **Good**: 5-10% return
- **Neutral**: -5% to 5% return
- **Poor**: -10% to -5% return
- **Terrible**: <-10% return

## Security Features

- **User Authentication**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own reports
- **Input Validation**: Comprehensive validation of all input data
- **SQL Injection Protection**: Using SQLAlchemy ORM with parameterized queries
- **Rate Limiting**: Built-in FastAPI rate limiting (can be configured)

## Future Enhancements

1. **Advanced Analytics**: Machine learning-based accuracy predictions
2. **Portfolio Integration**: Link reports to actual portfolio positions
3. **Alert System**: Notifications when reports need re-evaluation
4. **Export Features**: Export reports to PDF/Excel
5. **Collaboration**: Share reports with other users
6. **Backtesting**: Historical backtesting of analysis strategies
7. **Performance Benchmarking**: Compare against other users' performance

## Testing

The system includes comprehensive error handling and fallback mechanisms:
- API failures fall back to mock data for demonstration
- Database errors are properly logged and handled
- Frontend gracefully handles network issues
- Input validation prevents invalid data entry

## Deployment Notes

1. **Database Migration**: Run the updated `init.sql` script to create new tables
2. **Environment Variables**: Ensure API_BASE_URL is configured correctly
3. **Authentication**: JWT tokens must be properly configured
4. **Market Data**: Integrate with real market data service for production use

This report tracking system provides a comprehensive solution for monitoring and improving investment analysis performance over time.
