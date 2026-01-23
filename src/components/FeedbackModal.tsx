import { useState } from 'react';
import { WordGroup } from '../types';

export type GroupRating = 'excellent' | 'good' | 'too_easy' | 'bad' | null;

interface FeedbackModalProps {
  groups: WordGroup[];
  onSubmit: (ratings: Map<number, GroupRating>) => void;
  onSkip: () => void;
}

export function FeedbackModal({ groups, onSubmit, onSkip }: FeedbackModalProps) {
  // Track rating for each group by index
  const [ratings, setRatings] = useState<Map<number, GroupRating>>(new Map());

  const handleRating = (groupIndex: number, rating: GroupRating) => {
    const newRatings = new Map(ratings);
    if (newRatings.get(groupIndex) === rating) {
      // Deselect if clicking same rating again
      newRatings.delete(groupIndex);
    } else {
      newRatings.set(groupIndex, rating);
    }
    setRatings(newRatings);
  };

  const handleSubmit = () => {
    if (ratings.size === 0) {
      // No ratings given, just skip
      onSkip();
    } else {
      onSubmit(ratings);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Hur var grupperna?
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Hjälp oss förbättra spelet (valfritt)
        </p>

        <div className="space-y-4 mb-6">
          {groups.map((group, index) => {
            const selectedRating = ratings.get(index);

            return (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {/* Group info */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {group.category}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {group.words.join(', ')}
                  </p>
                </div>

                {/* Rating buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRating(index, 'excellent')}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedRating === 'excellent'
                        ? 'bg-orange-500 border-orange-500 text-white scale-105'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400'
                    }`}
                  >
                    🔥 Klurig/Jättebra
                  </button>

                  <button
                    onClick={() => handleRating(index, 'good')}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedRating === 'good'
                        ? 'bg-green-500 border-green-500 text-white scale-105'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                    }`}
                  >
                    ✅ Bra/Lagom
                  </button>

                  <button
                    onClick={() => handleRating(index, 'too_easy')}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedRating === 'too_easy'
                        ? 'bg-yellow-500 border-yellow-500 text-white scale-105'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-400'
                    }`}
                  >
                    😴 För lätt
                  </button>

                  <button
                    onClick={() => handleRating(index, 'bad')}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedRating === 'bad'
                        ? 'bg-red-500 border-red-500 text-white scale-105'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-400'
                    }`}
                  >
                    ❌ Dålig/Obegriplig
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onSkip}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Hoppa över
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {ratings.size > 0 ? 'Skicka feedback' : 'Fortsätt'}
          </button>
        </div>
      </div>
    </div>
  );
}
