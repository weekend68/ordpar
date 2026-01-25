-- Migration 009: Add show_almost_right_hint to sync "3 av 4 rätt!" hint between players
-- Shows helpful hint when players have 3 out of 4 words correct

ALTER TABLE game_sessions
ADD COLUMN show_almost_right_hint BOOLEAN DEFAULT false;

COMMENT ON COLUMN game_sessions.show_almost_right_hint IS 'Shows "3 av 4 rätt!" hint - synced between players';
