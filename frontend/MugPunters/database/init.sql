-- Initialize ASX Investment Research Platform Database
-- This script sets up the initial database structure

-- Create database if it doesn't exist
-- (This is handled by Docker, but included for reference)

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- (These will be created by SQLAlchemy, but included for reference)

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
