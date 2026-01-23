import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10  // Rate limit for realtime updates
    }
  },
  auth: {
    persistSession: false,  // No auth required for now (anonymous play)
    autoRefreshToken: false
  }
});

// Database types
export interface GameSession {
  id: string;
  session_code: string;
  word_set_id: string;
  player1_id: string | null;
  player2_id: string | null;
  current_player: 1 | 2;
  selected_words: string[];
  completed_groups: number[];
  moves_history: any[];
  status: 'waiting' | 'playing' | 'completed' | 'abandoned';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  last_activity: string;
  winner: 1 | 2 | null;
  total_moves: number;
}
