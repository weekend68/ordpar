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
  status: 'playing' | 'won' | 'given_up';

  // Animation
  shakingWords: Set<string>;
  showAlmostRightHint: boolean;
}

// Multiplayer-specific state extension
export interface MultiplayerGameState extends GameState {
  sessionId: string;
  sessionCode: string;
  localPlayerNumber: 1 | 2;
  isMyTurn: boolean;
  opponentConnected: boolean;
  winner: 1 | 2 | null;
  lastActivity: Date;
}
