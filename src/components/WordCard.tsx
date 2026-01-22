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
      className={`
        aspect-square flex items-center justify-center p-2
        rounded-lg border-2 transition-all duration-200
        ${isRevealed ? 'bg-blue-50 border-blue-400' : 'bg-gray-200 border-gray-400'}
        ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}
        ${isCompleted ? 'bg-green-50 border-green-500 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${isShaking ? 'animate-shake border-red-500' : ''}
      `}
    >
      <span
        className={`font-semibold text-center ${fontSizeClass} ${
          !isRevealed ? 'text-gray-500' : 'text-gray-900'
        }`}
      >
        {isRevealed ? word : '???'}
      </span>
    </div>
  );
}
