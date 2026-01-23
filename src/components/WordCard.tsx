import { getFontSize } from '../utils/fontSizer';

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
  const fontSizeClass = getFontSize(word);

  return (
    <div
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
      tabIndex={isCompleted ? -1 : 0}
      className={`
        h-12 flex items-center justify-center px-2 py-1.5
        rounded-lg transition-all duration-200
        ${isRevealed ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-750' : 'bg-gray-200 border border-transparent'}
        ${isSelected ? 'bg-blue-500 text-white border-2 border-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.8)] scale-[1.02]' : ''}
        ${isCompleted ? 'bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
        ${isShaking ? 'animate-shake bg-red-600 text-white border-2 border-red-400' : ''}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      `}
    >
      <span
        className={`${isSelected ? 'font-extrabold' : 'font-bold'} text-center ${fontSizeClass}`}
      >
        {isRevealed ? word : '???'}
      </span>
    </div>
  );
}
