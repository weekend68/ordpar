import { GameState } from '../types';
import { WordCard } from './WordCard';
import { CompletedGroups } from './CompletedGroups';

interface GameBoardProps {
  state: GameState;
  onWordClick: (word: string) => void;
  onGuess: () => void;
  onPass: () => void;
  onClear: () => void;
}

export function GameBoard({ state, onWordClick, onGuess, onPass, onClear }: GameBoardProps) {
  const {
    allWords,
    completedGroups,
    selectedWords,
    shakingWords,
    currentPlayer,
  } = state;

  // Filter out completed words from grid
  const completedWords = new Set(
    completedGroups.flatMap((g) => g.words)
  );
  const wordsInGrid = allWords.filter((w) => !completedWords.has(w));

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Ordpar</h1>
        <p className="text-xl text-gray-600 font-semibold">
          Spelare {currentPlayer}:s tur
        </p>
      </div>

      {/* Completed groups */}
      <CompletedGroups groups={completedGroups} />

      {/* Word grid - only show words not in completed groups */}
      <div className="grid grid-cols-4 gap-2 mb-6">
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

      {/* Action buttons when 4 words selected */}
      {selectedWords.size === 4 && (
        <div className="flex justify-center gap-3">
          <button
            onClick={onGuess}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Gissa
          </button>
          <button
            onClick={onPass}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Passa
          </button>
          <button
            onClick={onClear}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Rensa
          </button>
        </div>
      )}

      {/* Instruction text */}
      {selectedWords.size < 4 && (
        <div className="text-center text-gray-600">
          <p className="text-sm">
            Klicka ett ord för att markera det ({selectedWords.size}/4)
          </p>
        </div>
      )}
    </div>
  );
}
