-- Create group_feedback table to track individual group ratings
CREATE TABLE IF NOT EXISTS group_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE CASCADE,
  group_index INTEGER NOT NULL CHECK (group_index >= 0 AND group_index <= 3),
  rating TEXT NOT NULL CHECK (rating IN ('excellent', 'good', 'too_easy', 'bad')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying feedback by word_set
CREATE INDEX idx_group_feedback_word_set ON group_feedback(word_set_id);

-- Index for querying feedback by rating (to find bad groups)
CREATE INDEX idx_group_feedback_rating ON group_feedback(rating);

-- RLS policies
ALTER TABLE group_feedback ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert/read
CREATE POLICY "Service role can manage group_feedback"
  ON group_feedback
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE group_feedback IS 'Individual ratings for each group in a word set. Allows tracking which specific groups are good/bad over time.';
