import { WordGroup } from '../types';

interface GameResultProps {
  status: 'won' | 'given_up';
  groups: WordGroup[];
  completedGroups: WordGroup[];
  onPlayAgain: () => void;
  isMultiplayer: boolean;
  playAgainLabel?: string;
}

export function GameResult({
  status,
  groups,
  completedGroups,
  onPlayAgain,
  isMultiplayer,
  playAgainLabel = 'Tillbaka till startsidan',
}: GameResultProps) {
  const isWon = status === 'won';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center">
        {isWon ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-500 mb-2">Grattis!</h2>
            <p className="text-lg text-gray-300 mb-4">
              {isMultiplayer
                ? `Ni hittade alla ${groups.length} grupper tillsammans!`
                : `Du hittade alla ${groups.length} grupper!`}
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-3xl font-bold text-white mb-2">Tyvärr!</h2>
            <p className="text-lg text-gray-400 mb-4">
              {isMultiplayer ? 'Ni gav upp. Här är facit:' : 'Du gav upp. Här är facit:'}
            </p>
          </>
        )}

        {/* Show all groups (answer key) */}
        <div className="space-y-2 mb-6 text-left">
          {groups.map((group, idx) => {
            const wasCompleted = completedGroups.some(g => g.category === group.category);
            return (
              <div
                key={idx}
                className={`rounded-lg p-3 ${
                  wasCompleted
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gray-800'
                }`}
              >
                <div className="font-semibold text-sm text-white mb-1">
                  {wasCompleted ? '✓ ' : ''}{group.category}
                </div>
                <div className="text-xs text-gray-300">
                  {group.words.join(' • ')}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          {playAgainLabel}
        </button>
      </div>
    </div>
  );
}
