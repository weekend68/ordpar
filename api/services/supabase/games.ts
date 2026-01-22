import { getSupabaseClient } from './client.js';

export interface GameRecord {
  id: string;
  pair_id: string;
  word_set_id: string;
  player1_words: string[];
  player2_words: string[];
  moves: any[];
  result: 'win' | 'loss' | 'abandoned' | null;
  score: number | null;
  attempts_used: number;
  difficulty_level: 'LÄTT' | 'MEDEL' | 'SVÅR' | 'EXPERT';
  feedback_difficulty_p1: number | null;
  feedback_difficulty_p2: number | null;
  feedback_quality: number | null;
  feedback_bad_group: number | null;
  completed_at: string | null;
  created_at: string;
}

/**
 * Create a new game
 */
export async function createGame(
  pairId: string,
  wordSetId: string,
  player1Words: string[],
  player2Words: string[],
  difficultyLevel: 'LÄTT' | 'MEDEL' | 'SVÅR' | 'EXPERT'
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('games')
    .insert({
      pair_id: pairId,
      word_set_id: wordSetId,
      player1_words: player1Words,
      player2_words: player2Words,
      difficulty_level: difficultyLevel,
      moves: [],
      attempts_used: 0
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to create game:', error);
    throw new Error(`Failed to create game: ${error.message}`);
  }

  console.log(`🎮 Created game: ${data.id}`);
  return data.id;
}

/**
 * Get a game by ID
 */
export async function getGame(id: string): Promise<GameRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get game: ${error.message}`);
  }

  return data;
}

/**
 * Update game moves
 */
export async function updateGameMoves(
  gameId: string,
  moves: any[]
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('games')
    .update({ moves })
    .eq('id', gameId);

  if (error) {
    console.error('❌ Failed to update game moves:', error);
    throw new Error(`Failed to update game moves: ${error.message}`);
  }
}

/**
 * Complete a game with result
 */
export async function completeGame(
  gameId: string,
  result: 'win' | 'loss' | 'abandoned',
  score: number,
  attemptsUsed: number
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('games')
    .update({
      result,
      score,
      attempts_used: attemptsUsed,
      completed_at: new Date().toISOString()
    })
    .eq('id', gameId);

  if (error) {
    console.error('❌ Failed to complete game:', error);
    throw new Error(`Failed to complete game: ${error.message}`);
  }

  console.log(`✅ Game ${gameId} completed: ${result} (${score}p)`);
}

/**
 * Save game feedback
 */
export async function saveGameFeedback(
  gameId: string,
  feedbackDifficultyP1: number | null,
  feedbackDifficultyP2: number | null,
  feedbackQuality: number | null,
  feedbackBadGroup: number | null
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('games')
    .update({
      feedback_difficulty_p1: feedbackDifficultyP1,
      feedback_difficulty_p2: feedbackDifficultyP2,
      feedback_quality: feedbackQuality,
      feedback_bad_group: feedbackBadGroup
    })
    .eq('id', gameId);

  if (error) {
    console.error('❌ Failed to save feedback:', error);
    throw new Error(`Failed to save feedback: ${error.message}`);
  }

  console.log(`📝 Saved feedback for game ${gameId}`);
}

/**
 * Get all games for a pair
 */
export async function getPairGames(pairId: string): Promise<GameRecord[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('pair_id', pairId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to get pair games:', error);
    return [];
  }

  return data || [];
}
