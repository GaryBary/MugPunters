-- Initialize ASX Investment Research Platform Database
-- This script sets up the initial database structure

-- Create database if it doesn't exist
-- (This is handled by Docker, but included for reference)

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- (These will be created by SQLAlchemy, but included for reference)

-- Report Tracking Tables
-- These tables are created by SQLAlchemy models, but included for reference

-- Analysis Reports Table
-- CREATE TABLE analysis_reports (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id),
--     stock_symbol VARCHAR(10) NOT NULL,
--     parameters JSONB NOT NULL,
--     results JSONB NOT NULL,
--     risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('conservative', 'moderate', 'aggressive')),
--     timeframe VARCHAR(20) NOT NULL DEFAULT '1y',
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     is_active BOOLEAN DEFAULT TRUE
-- );

-- Report Performance Table
-- CREATE TABLE report_performance (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     report_id UUID NOT NULL REFERENCES analysis_reports(id) ON DELETE CASCADE,
--     stock_symbol VARCHAR(10) NOT NULL,
--     original_price DECIMAL(10,2) NOT NULL,
--     current_price DECIMAL(10,2) NOT NULL,
--     performance_pct DECIMAL(8,4) NOT NULL,
--     predicted_return DECIMAL(8,4),
--     actual_return DECIMAL(10,2) NOT NULL,
--     accuracy_score DECIMAL(3,2),
--     days_since_analysis INTEGER,
--     market_conditions JSONB,
--     last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Indexes for Report Tracking
-- CREATE INDEX idx_analysis_reports_user_id ON analysis_reports(user_id);
-- CREATE INDEX idx_analysis_reports_stock_symbol ON analysis_reports(stock_symbol);
-- CREATE INDEX idx_analysis_reports_created_at ON analysis_reports(created_at);
-- CREATE INDEX idx_analysis_reports_risk_level ON analysis_reports(risk_level);
-- CREATE INDEX idx_analysis_reports_timeframe ON analysis_reports(timeframe);

-- CREATE INDEX idx_report_performance_report_id ON report_performance(report_id);
-- CREATE INDEX idx_report_performance_stock_symbol ON report_performance(stock_symbol);
-- CREATE INDEX idx_report_performance_last_updated ON report_performance(last_updated);

-- Sample data for development (optional)
-- INSERT INTO stocks (symbol, name, exchange, sector, industry) VALUES
-- ('CBA', 'Commonwealth Bank of Australia', 'ASX', 'Financials', 'Banks'),
-- ('BHP', 'BHP Group Limited', 'ASX', 'Materials', 'Metals & Mining'),
-- ('WBC', 'Westpac Banking Corporation', 'ASX', 'Financials', 'Banks'),
-- ('ANZ', 'Australia and New Zealand Banking Group', 'ASX', 'Financials', 'Banks'),
-- ('NAB', 'National Australia Bank Limited', 'ASX', 'Financials', 'Banks'),
-- ('CSL', 'CSL Limited', 'ASX', 'Health Care', 'Biotechnology'),
-- ('WES', 'Wesfarmers Limited', 'ASX', 'Consumer Staples', 'Food & Staples Retailing'),
-- ('TLS', 'Telstra Corporation Limited', 'ASX', 'Communication Services', 'Telecommunications'),
-- ('RIO', 'Rio Tinto Limited', 'ASX', 'Materials', 'Metals & Mining'),
-- ('FMG', 'Fortescue Metals Group Limited', 'ASX', 'Materials', 'Metals & Mining');
