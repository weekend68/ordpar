-- Migration: Multiplayer game sessions
-- Description: Adds support for real-time multiplayer games with shareable session codes

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE NOT NULL,  -- 6-char shareable code (e.g., "XJ4K9P")
  word_set_id UUID NOT NULL REFERENCES word_sets(id),

  -- Players
  player1_id UUID REFERENCES users(id),  -- Creator (optional auth)
  player2_id UUID REFERENCES users(id),  -- Joiner (null until joined)

  -- Game state (real-time synced)
  current_player INTEGER NOT NULL DEFAULT 1 CHECK (current_player IN (1, 2)),
  selected_words JSONB DEFAULT '[]'::jsonb,  -- Array of selected word strings
  completed_groups JSONB DEFAULT '[]'::jsonb,  -- Array of completed group indices
  moves_history JSONB DEFAULT '[]'::jsonb,  -- Move log for replay/debugging

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'playing', 'completed', 'abandoned')),

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Win tracking
  winner INTEGER CHECK (winner IN (1, 2)),
  total_moves INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_game_sessions_code ON game_sessions(session_code);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_last_activity ON game_sessions(last_activity);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anyone to read/create sessions (anonymous play)
CREATE POLICY "Anyone can read game_sessions"
  ON game_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can create game_sessions"
  ON game_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update game_sessions"
  ON game_sessions FOR UPDATE USING (true);

-- Function: Generate unique 6-character session code
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- Exclude confusing chars (0, O, I, 1)
  result TEXT := '';
  i INTEGER;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  LOOP
    result := '';

    -- Generate 6-character code
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM game_sessions WHERE session_code = result) THEN
      RETURN result;
    END IF;

    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique session code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Cleanup function: Delete old abandoned sessions (run via cron)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM game_sessions
  WHERE status = 'waiting'
    AND created_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comment for documentation
COMMENT ON TABLE game_sessions IS 'Stores multiplayer game sessions with real-time state synchronization';
COMMENT ON FUNCTION generate_session_code() IS 'Generates unique 6-character session codes for multiplayer games';
COMMENT ON FUNCTION cleanup_stale_sessions() IS 'Removes abandoned game sessions older than 24 hours';
