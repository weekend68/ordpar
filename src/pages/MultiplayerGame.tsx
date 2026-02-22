import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateWordSet } from '../services/api';
import { useMultiplayerGameState } from '../hooks/useMultiplayerGameState';
import { GameBoard } from '../components/GameBoard';
import { GameResult } from '../components/GameResult';
import { LoadingScreen } from '../components/LoadingScreen';
import { WordSet } from '../types';

export function MultiplayerGame() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [wordSet, setWordSet] = useState<WordSet | null>(null);
  const [source, setSource] = useState<'gemini' | 'dn' | 'claude' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const emptyWordSet = useMemo(() => ({ id: '', groups: [] }), []);

  // Initialize multiplayer game state
  const { state, error: gameError, rematchSessionCode, toggleWordSelection, guessGroup, clearSelection, giveUp } =
    useMultiplayerGameState(
      sessionCode || '',
      wordSet ?? emptyWordSet,
      localPlayerNumber
    );

  const isCreatingRematch = useRef(false);

  const handlePlayAgain = useCallback(async () => {
    if (!sessionCode || isCreatingRematch.current) return;
    isCreatingRematch.current = true;

    try {
      // Check if the other player already initiated a rematch
      const { data: current } = await supabase
        .from('game_sessions')
        .select('rematch_session_code')
        .eq('session_code', sessionCode)
        .single();

      if (current?.rematch_session_code) {
        // Other player was first – join their session as player 2
        navigate(`/game/${current.rematch_session_code}?player=2`);
        return;
      }

      // We're first – create new session
      const { id: wordSetId, groups } = await generateWordSet({});
      const { data: codeData, error: codeError } = await supabase.rpc('generate_session_code');
      if (codeError) throw codeError;
      const newCode = codeData as string;

      const allWords = groups.flatMap(g => g.words);
      for (let i = allWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
      }

      const { error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          session_code: newCode,
          word_set_id: wordSetId,
          shuffled_words: allWords,
          status: 'playing',
          current_player: 1,
          started_at: new Date().toISOString(),
        });
      if (sessionError) throw sessionError;

      await supabase
        .from('game_sessions')
        .update({ rematch_session_code: newCode })
        .eq('session_code', sessionCode);

      navigate(`/game/${newCode}?player=1`);
    } catch (err) {
      console.error('Failed to create rematch:', err);
      isCreatingRematch.current = false;
    }
  }, [sessionCode, navigate]);

  // Auto-navigate when the other player initiates rematch
  useEffect(() => {
    if (rematchSessionCode && !isCreatingRematch.current) {
      navigate(`/game/${rematchSessionCode}?player=2`);
    }
  }, [rematchSessionCode, navigate]);

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
            onClick={() => navigate('/')}
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
    <div className="min-h-screen bg-gray-950 pt-2">
      {/* HUD - Instrumentpanel - ultra compact */}
      <div className="max-w-[430px] mx-auto px-3 mb-1.5">
        <div className={`bg-gray-900/50 backdrop-blur-sm border rounded-lg p-2 transition-all ${
          !state.isMyTurn && isOpponentConnected ? 'opacity-40' : 'border-gray-700'
        } ${state.isMyTurn && isOpponentConnected ? 'border-blue-500' : ''}`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 text-sm">🎮</span>
              <div>
                <div className="text-[10px] text-gray-500">Session</div>
                <div className="font-mono font-bold text-white text-xs">{sessionCode}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="text-center">
                <div className="text-[10px] text-gray-500">Spelare</div>
                <div className="text-base font-bold text-white">{localPlayerNumber}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!isOpponentConnected ? (
                <>
                  <span className="text-yellow-500 text-sm">⏳</span>
                  <div className="text-right">
                    <div className="text-[11px] text-yellow-500 font-semibold">Väntar...</div>
                  </div>
                </>
              ) : state.isMyTurn ? (
                <>
                  <span className="text-green-500 text-sm">👆</span>
                  <div className="text-right">
                    <div className="text-[11px] text-green-500 font-semibold">Din tur!</div>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-gray-500 text-sm">⏳</span>
                  <div className="text-right">
                    <div className="text-[11px] text-gray-400 font-semibold">Väntar...</div>
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
        onGiveUp={giveUp}
        source={source}
        isMyTurn={state.isMyTurn}
      />

      {/* Game Result */}
      {(state.status === 'won' || state.status === 'given_up') && wordSet && (
        <GameResult
          status={state.status}
          groups={wordSet.groups}
          completedGroups={state.completedGroups}
          onPlayAgain={handlePlayAgain}
          onExit={() => navigate('/')}
          isMultiplayer={true}
          playAgainLabel="Spela igen"
        />
      )}
    </div>
  );
}
