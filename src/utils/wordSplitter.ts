import { WordGroup } from '../types';

export function assignHints(groups: WordGroup[]): {
  player1Hint: string | null;
  player2Hint: string | null;
} {
  // Each player gets one category hint
  // Randomly select which categories they see
  const shuffled = [...groups].sort(() => Math.random() - 0.5);

  return {
    player1Hint: shuffled[0]?.category || null,
    player2Hint: shuffled[1]?.category || null,
  };
}
