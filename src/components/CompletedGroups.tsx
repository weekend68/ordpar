import { WordGroup } from '../types';

interface CompletedGroupsProps {
  groups: WordGroup[];
}

export function CompletedGroups({ groups }: CompletedGroupsProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {groups.map((group, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-3.5 shadow-lg"
        >
          <div className="font-bold text-sm mb-1">{group.category}</div>
          <div className="font-medium text-xs opacity-90">
            {group.words.join(' • ')}
          </div>
        </div>
      ))}
    </div>
  );
}
