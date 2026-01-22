import { WordGroup } from '../types';
import { getFontSize } from '../utils/fontSizer';

interface CompletedGroupsProps {
  groups: WordGroup[];
}

export function CompletedGroups({ groups }: CompletedGroupsProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {groups.map((group, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500 rounded-lg p-4"
        >
          <div className="font-bold text-green-800 mb-2">{group.category}</div>
          <div className="grid grid-cols-4 gap-2">
            {group.words.map((word) => (
              <div
                key={word}
                className="bg-white rounded px-2 py-1 text-center"
              >
                <span className={`font-medium ${getFontSize(word)}`}>
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
