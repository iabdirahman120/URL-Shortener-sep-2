-- Migration: tilføj kolonner til users og opretter nødvendige tabeller
-- Kør dette i din PostgreSQL database

-- Tilføj api_key, is_pro og stripe_customer_id til users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
