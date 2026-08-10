-- Migration: komplet skema for URL Shortener (shr.dk)
-- Kør dette i din PostgreSQL database. Alt er idempotent (kan køres flere gange).

-- === users: ekstra kolonner ===
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- === urls: password-beskyttede links ===
ALTER TABLE urls
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- === click_events: klik-statistik (referrer, enhed, tidspunkt) ===
CREATE TABLE IF NOT EXISTS click_events (
  id SERIAL PRIMARY KEY,
  url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  referrer TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_click_events_url_id ON click_events(url_id);
CREATE INDEX IF NOT EXISTS idx_click_events_clicked_at ON click_events(clicked_at);

-- === password_reset_tokens: glemt-kodeord-flow ===
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
