import { getSupabaseClient } from './client.js';
import { DifficultyProfile } from '../../types.js';

export interface PairRecord {
  id: string;
  player1_id: string;
  player2_id: string;
  difficulty_profile: DifficultyProfile;
  games_played: number;
  created_at: string;
}

/**
 * Create a new pair
 */
export async function createPair(
  player1Id: string,
  player2Id: string,
  difficultyProfile?: DifficultyProfile
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('pairs')
    .insert({
      player1_id: player1Id,
      player2_id: player2Id,
      difficulty_profile: difficultyProfile || {
        ordförråd: 'medel',
        ordlekar: 'medel',
        kulturella_referenser: 'medel',
        abstrakt_tänkande: 'medel'
      }
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to create pair:', error);
    throw new Error(`Failed to create pair: ${error.message}`);
  }

  console.log(`👥 Created pair: ${data.id}`);
  return data.id;
}

/**
 * Get a pair by ID
 */
export async function getPair(id: string): Promise<PairRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('pairs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get pair: ${error.message}`);
  }

  return data;
}

/**
 * Update pair difficulty profile based on feedback
 */
export async function updatePairDifficulty(
  pairId: string,
  difficultyProfile: DifficultyProfile
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('pairs')
    .update({ difficulty_profile: difficultyProfile })
    .eq('id', pairId);

  if (error) {
    console.error('❌ Failed to update pair difficulty:', error);
    throw new Error(`Failed to update pair difficulty: ${error.message}`);
  }

  console.log(`📈 Updated pair ${pairId} difficulty profile`);
}
