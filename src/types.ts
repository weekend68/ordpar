export interface WordGroup {
  category: string;
  words: string[];
  explanation?: string;
}

export interface WordSet {
  id: string;
  groups: WordGroup[];
}

export interface GameState {
  // Word set info
  groups: WordGroup[];
  allWords: string[];

  // Game state
  currentPlayer: 1 | 2;
  completedGroups: WordGroup[];
  selectedWords: Set<string>;

  // Status
  status: 'playing' | 'won';

  // Animation
  shakingWords: Set<string>;
}
