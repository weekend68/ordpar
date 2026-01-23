import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useMultiplayerGameState } from '../hooks/useMultiplayerGameState';
import { GameBoard } from '../components/GameBoard';
import { LoadingScreen } from '../components/LoadingScreen';
import { FeedbackModal, GroupRating } from '../components/FeedbackModal';
import { submitFeedback } from '../services/api';
import { WordSet } from '../types';

export function MultiplayerGame() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [wordSet, setWordSet] = useState<WordSet | null>(null);
  const [source, setSource] = useState<'gemini' | 'dn' | 'claude' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Get player number from query params
  const playerNumberStr = searchParams.get('player');
  const localPlayerNumber = (playerNumberStr === '1' ? 1 : 2) as 1 | 2;

  // Load word set and validate session
  useEffect(() => {
    let mounted = true;

    async function loadGameData() {
      if (!sessionCode) {
        setError('No session code provided');
        setIsLoading(false);
        return;
      }

      try {
        // Get session data
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('session_code', sessionCode)
          .single();

        if (sessionError || !session) {
          throw new Error('Session not found');
        }

        // Get word set
        const { data: wordSetData, error: wordSetError } = await supabase
          .from('word_sets')
          .select('id, groups, source')
          .eq('id', session.word_set_id)
          .single();

        if (wordSetError) {
          console.error('Word set error:', wordSetError);
          throw new Error(`Word set not found: ${wordSetError.message}`);
        }

        if (!wordSetData) {
          throw new Error('Word set data is empty');
        }

        if (!mounted) return; // Prevent state update if unmounted

        setWordSet({
          id: wordSetData.id,
          groups: wordSetData.groups,
        });
        setSource(wordSetData.source || null);
      } catch (err) {
        console.error('Failed to load game:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load game');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadGameData();

    return () => {
      mounted = false;
    };
  }, [sessionCode]);

  // Initialize multiplayer game state
  const { state, error: gameError, toggleWordSelection, guessGroup, passTurn, clearSelection } =
    useMultiplayerGameState(
      sessionCode || '',
      wordSet || { id: '', groups: [] },
      localPlayerNumber
    );

  // No longer needed - Realtime should handle this

  // Show win modal when game is won
  useEffect(() => {
    if (state?.status === 'won' && !showWinModal && !showFeedback) {
      setShowWinModal(true);
    }
  }, [state?.status, showWinModal, showFeedback]);

  // Handle feedback submission (Player 1 only)
  const handleFeedbackSubmit = useCallback(async (ratings: Map<number, GroupRating>) => {
    if (!wordSet) return;

    try {
      await submitFeedback(wordSet.id, ratings);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }

    setShowFeedback(false);
    // Don't show modal again - feedback is done
  }, [wordSet]);

  const handleFeedbackSkip = useCallback(() => {
    setShowFeedback(false);
    setShowWinModal(true);
  }, []);

  // Player 1 gets feedback modal, Player 2 just sees win screen
  const handleShowFeedback = useCallback(() => {
    setShowWinModal(false);
    setShowFeedback(true);
  }, []);

  // Check for disconnect (last activity > 2 minutes ago)
  // Opponent is connected if status is 'playing' or 'completed'
  const isOpponentConnected = state && (state.status === 'won' || state.opponentConnected);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || gameError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Något gick fel</h2>
          <p className="text-gray-700 mb-6">{error || gameError}</p>
          <button
            onClick={() => navigate('/multiplayer')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Tillbaka till lobby
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      {/* HUD - Instrumentpanel */}
      <div className="max-w-[430px] mx-auto px-3 mb-4">
        <div className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-3 transition-all ${
          !state.isMyTurn && isOpponentConnected ? 'opacity-40' : 'border-gray-700'
        } ${state.isMyTurn && isOpponentConnected ? 'border-blue-500' : ''}`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">🎮</span>
              <div>
                <div className="text-xs text-gray-500">Session</div>
                <div className="font-mono font-bold text-white">{sessionCode}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-xs text-gray-500">Spelare</div>
                <div className="text-lg font-bold text-white">{localPlayerNumber}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isOpponentConnected ? (
                <>
                  <span className="text-yellow-500">⏳</span>
                  <div className="text-right">
                    <div className="text-xs text-yellow-500 font-semibold">Väntar...</div>
                  </div>
                </>
              ) : state.isMyTurn ? (
                <>
                  <span className="text-green-500">👆</span>
                  <div className="text-right">
                    <div className="text-xs text-green-500 font-semibold">Din tur!</div>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-gray-500">⏳</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-semibold">Väntar...</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Game Board */}
      <GameBoard
        state={state}
        onWordClick={toggleWordSelection}
        onGuess={guessGroup}
        onClear={clearSelection}
        source={source}
        isMyTurn={state.isMyTurn}
      />

      {/* Win Modal */}
      {showWinModal && !showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Ni vann tillsammans!
            </h2>
            <p className="text-gray-700 mb-6">
              Båda spelarna samarbetade för att hitta alla fyra grupper!
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/multiplayer')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Tillbaka till lobby
              </button>

              {localPlayerNumber === 1 && (
                <button
                  onClick={handleShowFeedback}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Ge feedback på ordset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal (Player 1 only) */}
      {showFeedback && wordSet && localPlayerNumber === 1 && (
        <FeedbackModal
          groups={wordSet.groups}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
        />
      )}
    </div>
  );
}
