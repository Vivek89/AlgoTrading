-- Add theme_preference column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT 'dark';

-- Update existing users to have default theme
UPDATE users SET theme_preference = 'dark' WHERE theme_preference IS NULL;
