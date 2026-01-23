import { GameState } from '../types';
import { WordCard } from './WordCard';
import { CompletedGroups } from './CompletedGroups';
import { SourceAttribution } from './SourceAttribution';

interface GameBoardProps {
  state: GameState;
  onWordClick: (word: string) => void;
  onGuess: () => void;
  onClear: () => void;
  source?: 'gemini' | 'dn' | 'claude' | null;
  isMyTurn?: boolean; // For multiplayer - default true for single player
}

export function GameBoard({ state, onWordClick, onGuess, onClear, source, isMyTurn = true }: GameBoardProps) {
  const {
    allWords,
    completedGroups,
    selectedWords,
    shakingWords,
  } = state;

  // Filter out completed words from grid
  const completedWords = new Set(
    completedGroups.flatMap((g) => g.words)
  );
  const wordsInGrid = allWords.filter((w) => !completedWords.has(w));

  return (
    <div className="max-w-[430px] mx-auto px-3 py-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Ordspel
        </h1>
        <p className="text-sm text-gray-400">
          Gruppera orden fyra och fyra
        </p>
      </div>

      {/* Completed groups */}
      <CompletedGroups groups={completedGroups} />

      {/* Word grid - 2 columns x 8 rows for mobile */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {wordsInGrid.map((word) => {
          const isSelected = selectedWords.has(word);
          const isShaking = shakingWords.has(word);

          return (
            <WordCard
              key={word}
              word={word}
              isRevealed={true}
              isSelected={isSelected}
              isCompleted={false}
              isShaking={isShaking}
              onClick={() => onWordClick(word)}
            />
          );
        })}
      </div>

      {/* Action buttons - always visible */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onGuess}
          disabled={selectedWords.size !== 4 || !isMyTurn}
          className={`w-full h-14 font-bold text-lg px-8 rounded-xl transition-all ${
            selectedWords.size === 4 && isMyTurn
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg cursor-pointer'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          Gissa
        </button>
        <button
          onClick={onClear}
          disabled={selectedWords.size === 0 || !isMyTurn}
          className={`font-medium text-sm transition-colors ${
            selectedWords.size > 0 && isMyTurn
              ? 'text-gray-400 hover:text-white cursor-pointer'
              : 'text-gray-700 cursor-not-allowed'
          }`}
        >
          Rensa markering
        </button>
      </div>

      {/* Source attribution at bottom */}
      <SourceAttribution source={source} />

    </div>
  );
}
