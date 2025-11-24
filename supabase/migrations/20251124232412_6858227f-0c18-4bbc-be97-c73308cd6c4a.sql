-- Add geographic fields to analytics_sessions table
ALTER TABLE analytics_sessions 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS country_name TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_country ON analytics_sessions(country);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at);