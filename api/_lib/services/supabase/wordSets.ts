import { getSupabaseClient } from './client.js';
import { WordGroup } from '../../types.js';

export interface WordSetRecord {
  id: string;
  difficulty_level: 'LÄTT' | 'MEDEL' | 'SVÅR' | 'EXPERT';
  groups: WordGroup[];
  quality_score: number;
  times_used: number;
  used_by_users: string[];
  avg_completion_rate: number | null;
  created_at: string;
}

/**
 * Save a generated word set to the database
 */
export async function saveWordSet(
  groups: WordGroup[]
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('word_sets')
    .insert({
      groups: groups,
      quality_score: 0,
      times_used: 0,
      used_by_users: []
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to save word set:', error);
    throw new Error(`Failed to save word set: ${error.message}`);
  }

  console.log(`💾 Saved word set to database: ${data.id}`);
  return data.id;
}

/**
 * Get a word set by ID
 */
export async function getWordSet(id: string): Promise<WordSetRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('word_sets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to get word set: ${error.message}`);
  }

  return data;
}

/**
 * Get a random word set from cache (for quick serving, no user tracking)
 * Prefers newer AI-generated sets over older DN imports
 */
export async function getRandomWordSet(): Promise<WordSetRecord | null> {
  const supabase = getSupabaseClient();

  // Get 20 newest word sets (AI-generated), favor them 70% of the time
  const { data: newest, error: newestError } = await supabase
    .from('word_sets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Get 10 least-used word sets (mix of DN and AI)
  const { data: leastUsed, error: leastUsedError } = await supabase
    .from('word_sets')
    .select('*')
    .order('times_used', { ascending: true })
    .limit(10);

  if ((newestError || !newest || newest.length === 0) &&
      (leastUsedError || !leastUsed || leastUsed.length === 0)) {
    console.error('❌ Failed to get word sets');
    return null;
  }

  // 70% chance to use newest (AI-generated), 30% chance for least-used (DN mix)
  const useNewest = Math.random() < 0.7 && newest && newest.length > 0;
  const pool = useNewest ? newest : leastUsed;

  if (!pool || pool.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Find unused word sets for a specific user to avoid duplicates
 */
export async function findUnusedWordSet(
  userId: string
): Promise<WordSetRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('word_sets')
    .select('*')
    .not('used_by_users', 'cs', `{${userId}}`) // Not used by this user
    .order('quality_score', { ascending: false })
    .order('times_used', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ Failed to find unused word set:', error);
    return null;
  }

  return data;
}

/**
 * Get all word sets used by a user (to avoid duplicates when generating new ones)
 */
export async function getUserWordSets(userId: string): Promise<WordSetRecord[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('word_sets')
    .select('*')
    .contains('used_by_users', [userId])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to get user word sets:', error);
    return [];
  }

  return data || [];
}

/**
 * Update word set quality score based on feedback
 */
export async function updateWordSetQuality(
  wordSetId: string,
  qualityScore: number
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('word_sets')
    .update({ quality_score: qualityScore })
    .eq('id', wordSetId);

  if (error) {
    console.error('❌ Failed to update word set quality:', error);
    throw new Error(`Failed to update word set quality: ${error.message}`);
  }

  console.log(`📊 Updated word set ${wordSetId} quality to ${qualityScore}`);
}
