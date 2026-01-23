import { WordGroup } from '../types';

interface CompletedGroupsProps {
  groups: WordGroup[];
}

export function CompletedGroups({ groups }: CompletedGroupsProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-1 mb-2">
      {groups.map((group, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md p-2 shadow-lg"
        >
          <div className="font-bold text-[11px] mb-0.5">{group.category}</div>
          <div className="font-medium text-[10px] opacity-90">
            {group.words.join(' • ')}
          </div>
        </div>
      ))}
    </div>
  );
}
