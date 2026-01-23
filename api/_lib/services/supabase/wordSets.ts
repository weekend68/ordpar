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
  source?: 'gemini' | 'dn' | 'claude' | null;
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
 * Only returns AI-generated word sets (created today), no DN imports
 */
export async function getRandomWordSet(): Promise<WordSetRecord | null> {
  const supabase = getSupabaseClient();

  // Only get AI-generated word sets from today (2026-01-23 15:00 onwards)
  const aiGenerationStartDate = '2026-01-23T15:00:00Z';

  const { data, error } = await supabase
    .from('word_sets')
    .select('*')
    .gte('created_at', aiGenerationStartDate)
    .order('times_used', { ascending: true })
    .limit(50); // Increased from 20 to 50 for more variety

  if (error) {
    console.error('❌ Failed to get AI word sets:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No AI word sets available, need to generate new ones');
    return null;
  }

  // Pick a random one from the least-used AI sets
  const randomIndex = Math.floor(Math.random() * data.length);
  const selectedSet = data[randomIndex];

  // Increment times_used counter
  await supabase
    .from('word_sets')
    .update({ times_used: selectedSet.times_used + 1 })
    .eq('id', selectedSet.id);

  console.log(`📊 Using word set ${selectedSet.id} (times_used: ${selectedSet.times_used} -> ${selectedSet.times_used + 1})`);

  return selectedSet;
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
