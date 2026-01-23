-- Enable Realtime for game_sessions table
-- This is required for real-time multiplayer synchronization

-- Enable Realtime replication for the table
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

-- Verify replication is enabled
-- You can check this in Supabase Dashboard → Database → Replication
