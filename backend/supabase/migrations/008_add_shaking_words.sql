-- Migration 008: Add shaking_words to sync shake animation between players
-- Store which words are currently shaking (wrong guess) so both players see the same red flash

ALTER TABLE game_sessions
ADD COLUMN shaking_words JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN game_sessions.shaking_words IS 'Array of words currently showing shake animation - synced between players';
