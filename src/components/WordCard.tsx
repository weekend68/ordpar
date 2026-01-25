interface WordCardProps {
  word: string;
  isRevealed: boolean;
  isSelected: boolean;
  isCompleted: boolean;
  isShaking: boolean;
  onClick: () => void;
}

export function WordCard({
  word,
  isRevealed,
  isSelected,
  isCompleted,
  isShaking,
  onClick,
}: WordCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
      tabIndex={isCompleted ? -1 : 0}
      className={`
        h-14 flex items-center justify-center px-2.5 py-2
        rounded-lg transition-all duration-200
        ${isRevealed ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-750' : 'bg-gray-200 border border-transparent'}
        ${isSelected ? 'bg-gray-800 text-white border-4 border-white' : ''}
        ${isCompleted ? 'bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${isShaking ? 'animate-shake bg-red-600 text-white border-2 border-red-400' : ''}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
      `}
    >
      <span
        className={`${isSelected ? 'font-bold' : 'font-semibold'} text-center text-[15px]`}
      >
        {isRevealed ? word : '???'}
      </span>
    </div>
  );
}
