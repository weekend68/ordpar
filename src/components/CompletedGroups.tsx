import { WordGroup } from '../types';

interface CompletedGroupsProps {
  groups: WordGroup[];
}

export function CompletedGroups({ groups }: CompletedGroupsProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-1.5 mb-2.5">
      {groups.map((group, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2 shadow-lg"
        >
          <div className="font-semibold text-xs">{group.category}</div>
          <div className="font-normal text-[11px] opacity-90">
            {group.words.join(' • ')}
          </div>
        </div>
      ))}
    </div>
  );
}
