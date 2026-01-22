import { WordGroup } from '../types';

interface GameResultProps {
  status: 'won';
  groups: WordGroup[];
  completedGroups: WordGroup[];
  onPlayAgain: () => void;
}

export function GameResult({
  groups,
  onPlayAgain,
}: GameResultProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">Grattis!</h2>
        <p className="text-lg text-gray-700 mb-4">
          Ni hittade alla {groups.length} grupper tillsammans!
        </p>
        <button
          onClick={onPlayAgain}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Spela igen
        </button>
      </div>
    </div>
  );
}
