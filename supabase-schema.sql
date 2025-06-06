-- Fast Insight Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'ANALYST', 'VIEWER');
CREATE TYPE event_type AS ENUM ('PAGEVIEW', 'CUSTOM', 'REVENUE', 'OUTBOUND', 'DOWNLOAD');
CREATE TYPE goal_type AS ENUM ('PAGE_VIEW', 'CUSTOM_EVENT', 'REVENUE');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role user_role DEFAULT 'ANALYST',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id VARCHAR(255) UNIQUE NOT NULL, -- Public website ID for tracking script
    domain VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    public BOOLEAN DEFAULT false,
    share_id VARCHAR(255) UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(255) NOT NULL,
    type event_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    referrer TEXT,
    properties JSONB,
    revenue DECIMAL(10,2),
    currency VARCHAR(3),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type goal_type NOT NULL,
    value TEXT NOT NULL, -- URL pattern or event name
    revenue DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_site_id ON events(site_id);
CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_sites_website_id ON sites(website_id);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo user
INSERT INTO users (id, email, name, role) 
VALUES ('demo-user-uuid', 'demo@fastinsight.dev', 'Demo User', 'OWNER')
ON CONFLICT (email) DO NOTHING;

-- Insert demo site
INSERT INTO sites (id, website_id, domain, name, user_id) 
VALUES ('demo-site-uuid', 'demo-site-123', 'demo.fastinsight.dev', 'Demo Site', 'demo-user-uuid')
ON CONFLICT (website_id) DO NOTHING;

-- Insert sample events for testing
INSERT INTO events (site_id, session_id, visitor_id, type, name, url, referrer, properties) VALUES
('demo-site-uuid', 'session-1', 'visitor-1', 'PAGEVIEW', 'Homepage View', '/', 'https://google.com', '{"browser": "Chrome", "os": "Linux"}'),
('demo-site-uuid', 'session-1', 'visitor-1', 'PAGEVIEW', 'About View', '/about', '/', '{"browser": "Chrome", "os": "Linux"}'),
('demo-site-uuid', 'session-2', 'visitor-2', 'PAGEVIEW', 'Homepage View', '/', 'https://twitter.com', '{"browser": "Firefox", "os": "Windows"}'),
('demo-site-uuid', 'session-2', 'visitor-2', 'REVENUE', 'Purchase', '/checkout', '/pricing', '{"product": "Pro Plan", "browser": "Firefox", "os": "Windows"}'),
('demo-site-uuid', 'session-3', 'visitor-3', 'PAGEVIEW', 'Documentation', '/docs', 'https://github.com', '{"browser": "Safari", "os": "macOS"}')
ON CONFLICT DO NOTHING;

-- Update revenue for revenue events
UPDATE events SET revenue = 99.00, currency = 'USD' WHERE type = 'REVENUE';

-- Verify the setup
SELECT 'Schema created successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as site_count FROM sites;
SELECT COUNT(*) as event_count FROM events; 