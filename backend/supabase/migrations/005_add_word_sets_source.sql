-- Migration 005: Add source tracking to word_sets
-- Tracks where word sets came from (DN imports, Gemini AI, Claude AI)

-- Add source column
ALTER TABLE word_sets
ADD COLUMN source TEXT CHECK (source IN ('dn', 'gemini', 'claude'));

-- Set source for existing word sets
-- DN imports are before 2026-01-23 15:00:00 UTC
-- AI-generated are after that timestamp
UPDATE word_sets
SET source = CASE
  WHEN created_at < '2026-01-23T15:00:00Z' THEN 'dn'
  ELSE 'gemini'
END
WHERE source IS NULL;

-- Add index for filtering by source
CREATE INDEX idx_word_sets_source ON word_sets(source);

-- Comment on column
COMMENT ON COLUMN word_sets.source IS 'Source of the word set: dn (DN import), gemini (Gemini AI), claude (Claude AI)';
