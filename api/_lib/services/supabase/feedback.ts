import { getSupabaseClient } from './client.js';
import { getWordSet } from './wordSets.js';

export type GroupRating = 'excellent' | 'good' | 'too_easy' | 'bad';

interface GroupFeedback {
  group_index: number;
  rating: GroupRating;
}

/**
 * Convert rating to numeric score for quality calculation
 */
function ratingToScore(rating: GroupRating): number {
  switch (rating) {
    case 'excellent':
      return 4;
    case 'good':
      return 3;
    case 'too_easy':
      return 2;
    case 'bad':
      return 1;
  }
}

/**
 * Submit feedback for word groups
 */
export async function submitGroupFeedback(
  wordSetId: string,
  ratings: GroupFeedback[]
): Promise<void> {
  const supabase = getSupabaseClient();

  // Get the word set to access group data
  const wordSet = await getWordSet(wordSetId);
  if (!wordSet) {
    throw new Error('Word set not found');
  }

  // Process bad ratings - add to bad_groups table
  const badRatings = ratings.filter((r) => r.rating === 'bad');
  for (const feedback of badRatings) {
    const group = wordSet.groups[feedback.group_index];
    if (!group) continue;

    // Check if this pattern already exists
    const { data: existing } = await supabase
      .from('bad_groups')
      .select('id, reported_count')
      .eq('category', group.category)
      .contains('words', group.words)
      .maybeSingle();

    if (existing) {
      // Increment reported_count
      await supabase
        .from('bad_groups')
        .update({
          reported_count: existing.reported_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      console.log(`📈 Incremented bad_group: ${group.category} (count: ${existing.reported_count + 1})`);
    } else {
      // Insert new bad group
      await supabase.from('bad_groups').insert({
        category: group.category,
        words: group.words,
        pattern_type: group.type || null,
        reason: 'User reported as bad/obegriplig',
      });

      console.log(`🚫 New bad_group added: ${group.category}`);
    }
  }

  // Calculate average quality score from all ratings
  if (ratings.length > 0) {
    const totalScore = ratings.reduce((sum, r) => sum + ratingToScore(r.rating), 0);
    const avgScore = totalScore / ratings.length;

    // Update word set quality score
    await supabase
      .from('word_sets')
      .update({
        quality_score: avgScore,
      })
      .eq('id', wordSetId);

    console.log(`📊 Updated quality_score for ${wordSetId}: ${avgScore.toFixed(2)}`);
  }
}
