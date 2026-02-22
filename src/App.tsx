import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateWordSet } from './services/api';
import { useGameState } from './hooks/useGameState';
import { GameBoard } from './components/GameBoard';
import { GameResult } from './components/GameResult';
import { LoadingScreen } from './components/LoadingScreen';
import { WordSet } from './types';

function App() {
  const navigate = useNavigate();
  const [wordSet, setWordSet] = useState<WordSet | null>(null);
  const [source, setSource] = useState<'gemini' | 'dn' | 'claude' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load new word set (wrapped in useCallback to prevent infinite loops)
  const loadNewWordSet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { id, groups, source: wordSetSource } = await generateWordSet({});

      const newWordSet: WordSet = {
        id,
        groups,
      };

      setWordSet(newWordSet);
      setSource(wordSetSource || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load word set');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial word set on mount only once
  useEffect(() => {
    loadNewWordSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Initialize game state - must be called before any conditional returns (Rules of Hooks)
  // Create dummy wordSet for initial render before data loads
  const dummyWordSet: WordSet = {
    id: 'loading',
    groups: [],
  };
  const { state, toggleWordSelection, guessGroup, clearSelection, giveUp } =
    useGameState(wordSet || dummyWordSet);

  // ALL hooks must be before conditional returns - Rules of Hooks
  const handleBackToLobby = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (error || !wordSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Något gick fel</h2>
          <p className="text-gray-700 mb-6">{error || 'Kunde inte ladda ordset'}</p>
          <button
            onClick={loadNewWordSet}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 pt-2 min-h-screen">
      <GameBoard
        state={state}
        onWordClick={toggleWordSelection}
        onGuess={guessGroup}
        onClear={clearSelection}
        onGiveUp={giveUp}
        source={source}
      />

      {(state.status === 'won' || state.status === 'given_up') && (
        <GameResult
          status={state.status}
          groups={state.groups}
          completedGroups={state.completedGroups}
          onPlayAgain={handleBackToLobby}
          isMultiplayer={false}
        />
      )}
    </div>
  );
}

export default App;
