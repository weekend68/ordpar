import { GameState } from '../types';
import { WordCard } from './WordCard';
import { CompletedGroups } from './CompletedGroups';
import { SourceAttribution } from './SourceAttribution';

interface GameBoardProps {
  state: GameState;
  onWordClick: (word: string) => void;
  onGuess: () => void;
  onClear: () => void;
  onQuit?: () => void; // Optional quit handler
  source?: 'gemini' | 'dn' | 'claude' | null;
  isMyTurn?: boolean; // For multiplayer - default true for single player
}

export function GameBoard({ state, onWordClick, onGuess, onClear, onQuit, source, isMyTurn = true }: GameBoardProps) {
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
    <div className="max-w-[430px] mx-auto px-3 py-2">
      {/* Header - compact */}
      <div className="mb-2.5 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Ordspel
        </h1>
      </div>

      {/* Completed groups */}
      <CompletedGroups groups={completedGroups} />

      {/* Word grid - 2 columns x 8 rows for mobile */}
      <div className="grid grid-cols-2 gap-2 mb-2.5">
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
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onGuess}
          disabled={selectedWords.size !== 4 || !isMyTurn}
          className={`w-full h-12 font-semibold text-base px-6 rounded-lg transition-all ${
            selectedWords.size === 4 && isMyTurn
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg cursor-pointer'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          Gissa
        </button>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onClear}
            disabled={selectedWords.size === 0 || !isMyTurn}
            className={`font-normal transition-colors ${
              selectedWords.size > 0 && isMyTurn
                ? 'text-gray-400 hover:text-white cursor-pointer'
                : 'text-gray-700 cursor-not-allowed'
            }`}
          >
            Rensa markering
          </button>
          {onQuit && (
            <>
              <span className="text-gray-700">•</span>
              <button
                onClick={onQuit}
                className="font-normal text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Ge upp
              </button>
            </>
          )}
        </div>
      </div>

      {/* Source attribution at bottom */}
      <SourceAttribution source={source} />

    </div>
  );
}
