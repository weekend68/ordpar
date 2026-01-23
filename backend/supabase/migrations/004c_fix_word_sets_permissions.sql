-- Fix word_sets table permissions for multiplayer

-- Enable RLS (if not already enabled)
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read word sets (needed for multiplayer sessions)
DROP POLICY IF EXISTS "Anyone can read word_sets" ON word_sets;
CREATE POLICY "Anyone can read word_sets"
  ON word_sets FOR SELECT USING (true);

-- Allow anyone to insert word sets (for game creation)
DROP POLICY IF EXISTS "Anyone can insert word_sets" ON word_sets;
CREATE POLICY "Anyone can insert word_sets"
  ON word_sets FOR INSERT WITH CHECK (true);
