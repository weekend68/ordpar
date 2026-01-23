interface SourceAttributionProps {
  source?: 'gemini' | 'dn' | 'claude' | null;
}

export function SourceAttribution({ source }: SourceAttributionProps) {
  if (!source) return null;

  const sourceText = {
    gemini: 'Ordgrupperna är framtagna av Gemini AI',
    dn: 'Ordgrupperna är framtagna av DN',
    claude: 'Ordgrupperna är framtagna av Claude AI',
  };

  return (
    <div className="text-center py-4">
      <p className="text-xs text-gray-600">
        {sourceText[source]}
      </p>
    </div>
  );
}
