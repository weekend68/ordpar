ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS rematch_session_code TEXT DEFAULT NULL;
