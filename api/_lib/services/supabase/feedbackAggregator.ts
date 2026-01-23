import { getSupabaseClient } from './client.js';
import { getWordSet } from './wordSets.js';

interface GroupFeedbackAggregation {
  word_set_id: string;
  group_index: number;
  category: string;
  words: string[];
  excellent_count: number;
  good_count: number;
  too_easy_count: number;
  bad_count: number;
  total_count: number;
}

/**
 * Aggregate all feedback to show AI what works and what doesn't
 */
export async function aggregateGroupFeedback(): Promise<{
  excellent: GroupFeedbackAggregation[];
  good: GroupFeedbackAggregation[];
  too_easy: GroupFeedbackAggregation[];
  bad: GroupFeedbackAggregation[];
}> {
  const supabase = getSupabaseClient();

  // Get all feedback
  const { data: feedbackData, error } = await supabase
    .from('group_feedback')
    .select('word_set_id, group_index, rating')
    .order('created_at', { ascending: false })
    .limit(500); // Last 500 ratings to keep it recent

  if (error) {
    console.error('Failed to fetch feedback:', error);
    return { excellent: [], good: [], too_easy: [], bad: [] };
  }

  // Group by word_set_id and group_index
  const aggregated = new Map<string, GroupFeedbackAggregation>();

  for (const feedback of feedbackData || []) {
    const key = `${feedback.word_set_id}-${feedback.group_index}`;

    if (!aggregated.has(key)) {
      aggregated.set(key, {
        word_set_id: feedback.word_set_id,
        group_index: feedback.group_index,
        category: '',
        words: [],
        excellent_count: 0,
        good_count: 0,
        too_easy_count: 0,
        bad_count: 0,
        total_count: 0,
      });
    }

    const agg = aggregated.get(key)!;
    agg.total_count++;

    switch (feedback.rating) {
      case 'excellent':
        agg.excellent_count++;
        break;
      case 'good':
        agg.good_count++;
        break;
      case 'too_easy':
        agg.too_easy_count++;
        break;
      case 'bad':
        agg.bad_count++;
        break;
    }
  }

  // Fetch word set data for each aggregated group
  const enrichedAggregations: GroupFeedbackAggregation[] = [];
  const wordSetCache = new Map<string, any>();

  for (const agg of aggregated.values()) {
    // Get word set from cache or fetch
    let wordSet = wordSetCache.get(agg.word_set_id);
    if (!wordSet) {
      wordSet = await getWordSet(agg.word_set_id);
      if (wordSet) {
        wordSetCache.set(agg.word_set_id, wordSet);
      }
    }

    if (wordSet && wordSet.groups[agg.group_index]) {
      const group = wordSet.groups[agg.group_index];
      agg.category = group.category;
      agg.words = group.words;
      enrichedAggregations.push(agg);
    }
  }

  // Categorize by dominant rating
  const excellent: GroupFeedbackAggregation[] = [];
  const good: GroupFeedbackAggregation[] = [];
  const too_easy: GroupFeedbackAggregation[] = [];
  const bad: GroupFeedbackAggregation[] = [];

  for (const agg of enrichedAggregations) {
    const maxCount = Math.max(
      agg.excellent_count,
      agg.good_count,
      agg.too_easy_count,
      agg.bad_count
    );

    // Categorize by dominant feedback
    if (agg.excellent_count === maxCount) {
      excellent.push(agg);
    } else if (agg.good_count === maxCount) {
      good.push(agg);
    } else if (agg.too_easy_count === maxCount) {
      too_easy.push(agg);
    } else if (agg.bad_count === maxCount) {
      bad.push(agg);
    }
  }

  // Sort by count (descending)
  excellent.sort((a, b) => b.excellent_count - a.excellent_count);
  good.sort((a, b) => b.good_count - a.good_count);
  too_easy.sort((a, b) => b.too_easy_count - a.too_easy_count);
  bad.sort((a, b) => b.bad_count - a.bad_count);

  console.log(`📊 Aggregated feedback: ${excellent.length} excellent, ${good.length} good, ${too_easy.length} too_easy, ${bad.length} bad`);

  return { excellent, good, too_easy, bad };
}

/**
 * Format aggregated feedback for AI prompt
 */
export function formatFeedbackForAI(aggregated: {
  excellent: GroupFeedbackAggregation[];
  good: GroupFeedbackAggregation[];
  too_easy: GroupFeedbackAggregation[];
  bad: GroupFeedbackAggregation[];
}): string {
  const sections: string[] = [];

  // Excellent examples (top 10)
  if (aggregated.excellent.length > 0) {
    sections.push('EXCELLENT EXAMPLES (lär dig från dessa - perfekt svårighetsnivå):');
    aggregated.excellent.slice(0, 10).forEach((agg, i) => {
      sections.push(`${i + 1}. ${agg.category}: [${agg.words.join(', ')}] (${agg.excellent_count}x 🔥)`);
    });
  }

  // Good examples (top 10)
  if (aggregated.good.length > 0) {
    sections.push('\nGOOD EXAMPLES (funkar bra):');
    aggregated.good.slice(0, 10).forEach((agg, i) => {
      sections.push(`${i + 1}. ${agg.category}: [${agg.words.join(', ')}] (${agg.good_count}x ✅)`);
    });
  }

  // Too easy (top 5)
  if (aggregated.too_easy.length > 0) {
    sections.push('\nTOO EASY (gör mer intressant än dessa):');
    aggregated.too_easy.slice(0, 5).forEach((agg, i) => {
      sections.push(`${i + 1}. ${agg.category}: [${agg.words.join(', ')}] (${agg.too_easy_count}x 😴 för uppenbart)`);
    });
  }

  // Bad patterns (top 5)
  if (aggregated.bad.length > 0) {
    sections.push('\nBAD PATTERNS (undvik helt):');
    aggregated.bad.slice(0, 5).forEach((agg, i) => {
      sections.push(`${i + 1}. ${agg.category}: [${agg.words.join(', ')}] (${agg.bad_count}x ❌ obegripligt)`);
    });
  }

  if (sections.length === 0) {
    return 'Ingen feedback än. Skapa intressanta grupper med variation i komplexitet.';
  }

  return sections.join('\n');
}
