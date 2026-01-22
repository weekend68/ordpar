import { WordGroup, GroupQuality } from '../../types.js';

const QUALITY_RANK = {
  'excellent': 4,
  'good': 3,
  'acceptable': 2,
  'poor': 1
};

export function selectBest4Groups(
  groups: WordGroup[],
  qualityScores: GroupQuality[]
): WordGroup[] {

  // Rank groups by quality
  const ranked = groups.map((group, index) => ({
    group,
    quality: qualityScores[index],
    index
  })).sort((a, b) => {
    return QUALITY_RANK[b.quality.quality] - QUALITY_RANK[a.quality.quality];
  });

  // Filter out 'poor' quality groups
  const acceptable = ranked.filter(r => r.quality.quality !== 'poor');

  if (acceptable.length < 4) {
    throw new Error(`Not enough acceptable groups: only ${acceptable.length} of 6 are not poor quality`);
  }

  // Select top 4 with diversity
  const selected: WordGroup[] = [];
  const usedTypes = new Set<string>();
  const usedDifficulties = new Set<string>();

  // First pass: prioritize diversity
  for (const { group, quality } of acceptable) {
    if (selected.length >= 4) break;

    const needsType = !usedTypes.has(group.type);
    const needsDifficulty = !usedDifficulties.has(group.difficulty);

    if (needsType || needsDifficulty || selected.length < 2) {
      selected.push(group);
      usedTypes.add(group.type);
      usedDifficulties.add(group.difficulty);
    }
  }

  // Second pass: fill remaining slots with best quality
  if (selected.length < 4) {
    for (const { group } of acceptable) {
      if (selected.length >= 4) break;
      if (!selected.includes(group)) {
        selected.push(group);
      }
    }
  }

  // Verify no duplicate words
  const allWords = new Set<string>();
  for (const group of selected) {
    for (const word of group.words) {
      if (allWords.has(word)) {
        throw new Error(`Duplicate word detected: ${word}`);
      }
      allWords.add(word);
    }
  }

  console.log(`✨ Selected 4 best groups (${selected.length} total)`);
  selected.forEach((g, i) => {
    console.log(`   ${i + 1}. ${g.category} (${g.type}, ${g.difficulty})`);
  });

  return selected;
}
