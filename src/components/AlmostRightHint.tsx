/**
 * Shows "3 av 4 rätt!" hint when user has 3 correct words in a group
 * (like DN's helpful hint system)
 */

interface AlmostRightHintProps {
  show: boolean;
}

export function AlmostRightHint({ show }: AlmostRightHintProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 animate-bounce">
      <div className="bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-full shadow-lg">
        3 av 4 rätt!
      </div>
    </div>
  );
}
