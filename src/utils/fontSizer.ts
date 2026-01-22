export function getFontSize(word: string): string {
  if (word.length <= 8) return 'text-xl';
  if (word.length <= 12) return 'text-base';
  if (word.length <= 16) return 'text-sm';
  return 'text-xs';
}
