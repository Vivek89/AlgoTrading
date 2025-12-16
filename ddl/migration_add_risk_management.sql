-- Migration to add risk_management column to strategies table
-- Date: 2025-01-XX
-- Purpose: Sprint 6 - Add Lock & Trail risk management support

-- Add risk_management JSON column to user_strategies table
ALTER TABLE user_strategies ADD COLUMN IF NOT EXISTS risk_management JSONB DEFAULT NULL;

-- Create index for risk_management queries
CREATE INDEX IF NOT EXISTS idx_strategies_risk_mode 
ON user_strategies((risk_management->>'mode'));

-- Add comment describing the structure
COMMENT ON COLUMN user_strategies.risk_management IS 
'Risk management configuration in JSON format:
{
  "mode": "NONE" | "LOCK" | "TRAIL" | "LOCK_AND_TRAIL",
  "combined_premium_sl": number (percentage),
  "combined_premium_target": number (percentage),
  "individual_leg_sl": number (percentage, optional),
  "lock_and_trail": {
    "activation_level": number (percentage),
    "lock_profit": number (percentage),
    "trail_step": number (percentage),
    "trail_profit": number (percentage)
  }
}';
