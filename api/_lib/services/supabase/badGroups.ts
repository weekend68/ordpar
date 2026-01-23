import { getSupabaseClient } from './client.js';

export interface BadGroupRecord {
  id: string;
  category: string;
  words: string[];
  pattern_type: string | null;
  reason: string;
  reported_count: number;
  created_at: string;
  updated_at: string;
}

// Note: saveBadGroup is now handled in feedback.ts when rating='bad'

/**
 * Get bad groups to avoid in AI generation
 * Returns groups that have been reported as bad, sorted by report count
 */
export async function getBadGroups(minReports: number = 1): Promise<BadGroupRecord[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('bad_groups')
    .select('*')
    .gte('reported_count', minReports)
    .order('reported_count', { ascending: false })
    .limit(50); // Limit to avoid sending too much data to AI

  if (error) {
    console.error('❌ Failed to get bad groups:', error);
    return [];
  }

  const count = data ? data.length : 0;
  console.log(`🚫 Found ${count} bad groups (min reports: ${minReports})`);

  return data || [];
}

/**
 * Format bad groups as patterns for AI to avoid
 */
export function formatBadPatternsForAI(badGroups: BadGroupRecord[]): string[] {
  return badGroups.map((group) => {
    const wordsStr = group.words.join(', ');
    return `${group.category}: [${wordsStr}] - ${group.reason} (${group.reported_count}x rapporterad)`;
  });
}
