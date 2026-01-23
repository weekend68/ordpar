import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateWordSet } from '../services/api';

export function GameLobby() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Generate word set from backend API
      const { id: wordSetId } = await generateWordSet({});

      // 2. Generate unique session code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_session_code');

      if (codeError) throw codeError;
      const sessionCode = codeData as string;

      // 3. Create game session
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          session_code: sessionCode,
          word_set_id: wordSetId,
          status: 'waiting',
          current_player: 1,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      console.log('✅ Created game session:', session);

      // Show the code to the user
      setCreatedCode(sessionCode);
      setMode('create');
    } catch (err) {
      console.error('❌ Failed to create game:', err);
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWaiting = () => {
    if (createdCode) {
      navigate(`/game/${createdCode}?player=1`);
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode || joinCode.length !== 6) {
      setError('Session code must be 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const upperCode = joinCode.toUpperCase();

      // 1. Check if session exists
      const { data: session, error: fetchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('session_code', upperCode)
        .single();

      if (fetchError || !session) {
        throw new Error('Session not found. Check the code and try again.');
      }

      if (session.status !== 'waiting') {
        throw new Error('This game has already started or ended.');
      }

      // 2. Update session status to playing
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          status: 'playing',
          started_at: new Date().toISOString(),
        })
        .eq('session_code', upperCode);

      if (updateError) throw updateError;

      console.log('✅ Joined game session:', session);

      // 3. Navigate to game
      navigate(`/game/${upperCode}?player=2`);
    } catch (err) {
      console.error('❌ Failed to join game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMenu = () => {
    setMode('menu');
    setError(null);
    setJoinCode('');
    setCreatedCode(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-[90%]">
        {/* Menu */}
        {mode === 'menu' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Ordspel</h1>
              <p className="text-gray-400">Välj spelläge</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCreateGame}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                {isLoading ? 'Skapar spel...' : 'Skapa multiplayer-spel'}
              </button>

              <button
                onClick={() => setMode('join')}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                Joina spel med kod
              </button>

              <button
                onClick={() => navigate('/singleplayer')}
                disabled={isLoading}
                className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                Enspelare (lokalt)
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </>
        )}

        {/* Create/Waiting Mode */}
        {mode === 'create' && createdCode && (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Spel skapat!</h2>
              <p className="text-gray-600 mb-6">Dela denna kod med din motspelare</p>

              <div className="bg-gray-800 border-2 border-blue-500 rounded-2xl p-8 mb-6">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Session Code</div>
                <div className="text-5xl font-mono font-bold text-white tracking-[0.3em]">
                  {createdCode}
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Dela länken eller koden med din motspelare
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/game/${createdCode}?player=2`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Ordspel - Joina mitt spel!',
                        text: `Joina mitt Ordspel med kod: ${createdCode}`,
                        url: shareUrl,
                      });
                    } catch (err) {
                      console.log('Share cancelled');
                    }
                  } else {
                    // Fallback: kopiera länk
                    navigator.clipboard.writeText(shareUrl);
                    alert('Länk kopierad till urklipp!');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                📤 Dela länk
              </button>

              <button
                onClick={handleStartWaiting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Gå till spelet
              </button>

              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Tillbaka
              </button>
            </div>
          </>
        )}

        {/* Join Mode */}
        {mode === 'join' && (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔑</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Joina spel</h2>
              <p className="text-gray-600">Ange 6-siffrig spelkod</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XJ4K9P"
                maxLength={6}
                className="w-full text-center text-5xl font-mono font-bold tracking-[0.3em] py-6 px-6 bg-gray-800 border-2 border-gray-700 rounded-2xl focus:border-blue-500 focus:outline-none uppercase text-white placeholder:text-gray-600"
                disabled={isLoading}
              />

              <button
                onClick={handleJoinGame}
                disabled={isLoading || joinCode.length !== 6}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Joinaer...' : 'Joina spel'}
              </button>

              <button
                onClick={handleBackToMenu}
                disabled={isLoading}
                className="w-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Tillbaka
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
