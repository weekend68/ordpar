-- Ordpar Database Schema
-- Migration 001: Initial schema setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pairs table (spelpar)
CREATE TABLE pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty_profile JSONB DEFAULT '{
    "ordförråd": "medel",
    "ordlekar": "medel",
    "kulturella_referenser": "medel",
    "abstrakt_tänkande": "medel"
  }'::jsonb,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

-- Word_sets table (cache of generated sets)
CREATE TABLE word_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('LÄTT', 'MEDEL', 'SVÅR', 'EXPERT')),
  groups JSONB NOT NULL,
  quality_score DECIMAL(3,2) DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  used_by_users UUID[] DEFAULT '{}',
  avg_completion_rate DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pair_id UUID NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
  word_set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE RESTRICT,
  player1_words JSONB NOT NULL,
  player2_words JSONB NOT NULL,
  moves JSONB DEFAULT '[]'::jsonb,
  result TEXT CHECK (result IN ('win', 'loss', 'abandoned')),
  score INTEGER,
  attempts_used INTEGER DEFAULT 0,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('LÄTT', 'MEDEL', 'SVÅR', 'EXPERT')),
  feedback_difficulty_p1 INTEGER CHECK (feedback_difficulty_p1 BETWEEN 1 AND 5),
  feedback_difficulty_p2 INTEGER CHECK (feedback_difficulty_p2 BETWEEN 1 AND 5),
  feedback_quality INTEGER CHECK (feedback_quality BETWEEN 1 AND 5),
  feedback_bad_group INTEGER CHECK (feedback_bad_group BETWEEN 0 AND 3),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bad_groups table (negative training data)
CREATE TABLE bad_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  words JSONB NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pairs_player1 ON pairs(player1_id);
CREATE INDEX idx_pairs_player2 ON pairs(player2_id);
CREATE INDEX idx_games_pair ON games(pair_id);
CREATE INDEX idx_games_word_set ON games(word_set_id);
CREATE INDEX idx_games_completed ON games(completed_at);
CREATE INDEX idx_word_sets_difficulty ON word_sets(difficulty_level);
CREATE INDEX idx_word_sets_quality ON word_sets(quality_score DESC);
CREATE INDEX idx_bad_groups_user ON bad_groups(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bad_groups ENABLE ROW LEVEL SECURITY;

-- Users can read all users (for creating pairs)
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  USING (true);

-- Users can insert themselves
CREATE POLICY "Users can insert themselves"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can read pairs they're part of
CREATE POLICY "Users can read their pairs"
  ON pairs FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Users can create pairs if they're one of the players
CREATE POLICY "Users can create pairs"
  ON pairs FOR INSERT
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Users can read games for their pairs
CREATE POLICY "Users can read their games"
  ON games FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pairs
      WHERE pairs.id = games.pair_id
      AND (pairs.player1_id = auth.uid() OR pairs.player2_id = auth.uid())
    )
  );

-- Users can create games for their pairs
CREATE POLICY "Users can create games"
  ON games FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pairs
      WHERE pairs.id = pair_id
      AND (pairs.player1_id = auth.uid() OR pairs.player2_id = auth.uid())
    )
  );

-- Users can update their games
CREATE POLICY "Users can update their games"
  ON games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pairs
      WHERE pairs.id = games.pair_id
      AND (pairs.player1_id = auth.uid() OR pairs.player2_id = auth.uid())
    )
  );

-- Word sets are readable by all authenticated users
CREATE POLICY "Authenticated users can read word_sets"
  ON word_sets FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert/update word_sets
-- (Done via backend with service key)

-- Users can read all bad_groups (for AI training)
CREATE POLICY "Users can read bad_groups"
  ON bad_groups FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own bad_groups
CREATE POLICY "Users can insert bad_groups"
  ON bad_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Functions for updating stats
CREATE OR REPLACE FUNCTION increment_games_played()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pairs
  SET games_played = games_played + 1
  WHERE id = NEW.pair_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_games_played
  AFTER INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION increment_games_played();

CREATE OR REPLACE FUNCTION increment_word_set_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE word_sets
  SET
    times_used = times_used + 1,
    used_by_users = array_append(
      COALESCE(used_by_users, '{}'),
      (SELECT player1_id FROM pairs WHERE id = NEW.pair_id)
    )
  WHERE id = NEW.word_set_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_word_set_usage
  AFTER INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION increment_word_set_usage();

-- Update word set quality score based on feedback
CREATE OR REPLACE FUNCTION update_word_set_quality()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.feedback_quality IS NOT NULL THEN
    UPDATE word_sets
    SET quality_score = (
      SELECT AVG(feedback_quality)::DECIMAL(3,2)
      FROM games
      WHERE word_set_id = NEW.word_set_id
      AND feedback_quality IS NOT NULL
    )
    WHERE id = NEW.word_set_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_word_set_quality
  AFTER UPDATE ON games
  FOR EACH ROW
  WHEN (NEW.feedback_quality IS NOT NULL)
  EXECUTE FUNCTION update_word_set_quality();
