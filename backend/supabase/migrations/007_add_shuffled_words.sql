-- Migration 007: Add shuffled word order to game_sessions
-- Store shuffled words once when session is created so both players see same order

ALTER TABLE game_sessions
ADD COLUMN shuffled_words JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN game_sessions.shuffled_words IS 'Array of all words in shuffled order - same for both players';
