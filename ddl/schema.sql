-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create ENUM Types for fixed categories
CREATE TYPE subscription_tier_type AS ENUM ('FREE', 'PRO', 'WHALE');
CREATE TYPE strategy_status_type AS ENUM ('ACTIVE', 'PAUSED', 'PAPER_ONLY');
CREATE TYPE suggestion_status_type AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE transaction_type_enum AS ENUM ('BUY', 'SELL');

-- 2. USERS TABLE (Identity Zone)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_sub_id VARCHAR(255) UNIQUE NOT NULL, -- Google OpenID Subject
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    tier subscription_tier_type DEFAULT 'FREE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BROKER CREDENTIALS (The Vault)
-- SECURITY WARNING: api_secret_enc and totp_key_enc must be encrypted 
-- at the application level before insertion.
CREATE TABLE broker_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    broker_name VARCHAR(50) DEFAULT 'ZERODHA',
    zerodha_user_id VARCHAR(20) NOT NULL,
    api_key VARCHAR(100) NOT NULL,
    api_secret_enc TEXT NOT NULL,      -- Encrypted
    totp_key_enc TEXT NOT NULL,        -- Encrypted
    zerodha_password_enc TEXT NOT NULL,-- Encrypted (Needed for headless login)
    daily_access_token TEXT,           -- Nullable, updated daily
    token_generated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_broker_user UNIQUE (user_id, broker_name)
);

-- 4. USER STRATEGIES (Flexible Engine)
CREATE TABLE user_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strategy_name VARCHAR(100) NOT NULL,
    strategy_type VARCHAR(50) NOT NULL, -- e.g., 'SHORT_STRADDLE'
    parameters JSONB NOT NULL DEFAULT '{}', -- Flexible config (lots, SL, times)
    status strategy_status_type DEFAULT 'PAPER_ONLY',
    last_run_at TIMESTAMP WITH TIME ZONE
);

-- 5. STRATEGY SUGGESTIONS (The Advisor)
CREATE TABLE strategy_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_strategy_id UUID NOT NULL REFERENCES user_strategies(id) ON DELETE CASCADE,
    trigger_reason VARCHAR(255),        -- e.g., "VIX > 20"
    suggested_change JSONB NOT NULL,    -- e.g., {"stop_loss_pct": 25}
    status suggestion_status_type DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TRADE LOGS (Audit Trail)
CREATE TABLE trade_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    strategy_id UUID REFERENCES user_strategies(id),
    zerodha_order_id VARCHAR(50),
    instrument VARCHAR(50),
    transaction_type transaction_type_enum NOT NULL,
    quantity INT NOT NULL,
    average_price DECIMAL(10, 2),
    pnl_realized DECIMAL(10, 2),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_users_google ON users(google_sub_id);
CREATE INDEX idx_strategies_user ON user_strategies(user_id);
CREATE INDEX idx_logs_user_date ON trade_logs(user_id, executed_at);
