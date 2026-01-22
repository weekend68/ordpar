import { getSupabaseClient } from './client.js';

export interface BadGroupRecord {
  id: string;
  user_id: string | null;
  category: string;
  words: string[];
  reason: string;
  created_at: string;
}

/**
 * Save a bad group (negative training data)
 */
export async function saveBadGroup(
  userId: string | null,
  category: string,
  words: string[],
  reason: string
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('bad_groups')
    .insert({
      user_id: userId,
      category,
      words,
      reason
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to save bad group:', error);
    throw new Error(`Failed to save bad group: ${error.message}`);
  }

  console.log(`🚫 Saved bad group: ${category}`);
  return data.id;
}

/**
 * Get all bad groups (for AI training)
 */
export async function getAllBadGroups(): Promise<BadGroupRecord[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('bad_groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to get bad groups:', error);
    return [];
  }

  return data || [];
}

/**
 * Format bad groups as training patterns for AI
 */
export function formatBadGroupsForAI(badGroups: BadGroupRecord[]): string[] {
  return badGroups.map(bg => {
    return `Undvik: "${bg.category}" med orden [${bg.words.join(', ')}]. Anledning: ${bg.reason}`;
  });
}
