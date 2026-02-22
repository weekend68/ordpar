import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, GameSession } from '../lib/supabase';
import { MultiplayerGameState, WordSet, WordGroup } from '../types';

function initMultiplayerGame(
  wordSet: WordSet,
  sessionId: string,
  sessionCode: string,
  localPlayerNumber: 1 | 2,
  session: GameSession
): MultiplayerGameState {
  // Use shuffled words from database - same order for both players!
  const allWords = session.shuffled_words;

  return {
    groups: wordSet.groups,
    allWords,
    currentPlayer: session.current_player,
    completedGroups: session.completed_groups
      .map(idx => wordSet.groups[idx])
      .filter(g => g !== undefined), // Filter out invalid indices
    selectedWords: new Set(session.selected_words),
    status: session.status === 'completed' ? 'won' : 'playing',
    shakingWords: new Set(session.shaking_words || []),
    showAlmostRightHint: false,
    sessionId,
    sessionCode,
    localPlayerNumber,
    isMyTurn: session.current_player === localPlayerNumber,
    opponentConnected: session.status === 'playing' || session.status === 'completed',
    winner: session.winner,
    lastActivity: new Date(session.last_activity),
  };
}

export function useMultiplayerGameState(
  sessionCode: string,
  wordSet: WordSet,
  localPlayerNumber: 1 | 2
) {
  const [state, setState] = useState<MultiplayerGameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rematchSessionCode, setRematchSessionCode] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isUpdatingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // Load initial session data
  useEffect(() => {
    async function loadSession() {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('session_code', sessionCode)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Session not found');

        sessionIdRef.current = data.id;
        setState((prev) => {
          const newState = initMultiplayerGame(wordSet, data.id, sessionCode, localPlayerNumber, data);
          // Preserve opponentConnected if already established (prevents race condition reset)
          if (prev?.opponentConnected) newState.opponentConnected = true;
          return newState;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      }
    }

    loadSession();
  }, [sessionCode, wordSet, localPlayerNumber]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!sessionIdRef.current) return;

    const channel = supabase
      .channel(`game:${sessionCode}:${Date.now()}`) // Unique channel per mount
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `session_code=eq.${sessionCode}`,
        },
        (payload) => {
          // Don't skip echo - just update state
          // The issue is that we need to see ALL updates

          // Sync remote state to local
          const session = payload.new as GameSession;
          setState((prev) => {
            if (!prev) return prev;

            const newIsMyTurn = session.current_player === localPlayerNumber;

            return {
              ...prev,
              currentPlayer: session.current_player,
              selectedWords: new Set(session.selected_words),
              shakingWords: new Set(session.shaking_words || []),
              showAlmostRightHint: session.show_almost_right_hint || false,
              completedGroups: session.completed_groups
                .map(idx => wordSet.groups[idx])
                .filter(g => g !== undefined), // Filter out invalid indices
              isMyTurn: newIsMyTurn,
              opponentConnected: true, // receiving any realtime event = opponent is here
              status: session.status === 'completed' ? 'won' : 'playing',
              winner: session.winner,
              lastActivity: new Date(session.last_activity),
            };
          });

          // Check for rematch
          if (session.rematch_session_code) {
            setRematchSessionCode(session.rematch_session_code);
          }

          // Reset updating flag after a delay
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionCode, wordSet, localPlayerNumber]);

  // Update remote state
  const updateRemoteState = useCallback(async (updates: {
    currentPlayer: 1 | 2;
    selectedWords: Set<string>;
    shakingWords?: Set<string>;
    showAlmostRightHint?: boolean;
    completedGroups: WordGroup[];
    status?: 'playing' | 'completed';
    winner?: 1 | 2 | null;
  }) => {
    if (!sessionIdRef.current) return;

    isUpdatingRef.current = true;

    try {
      const completedGroupIndices = updates.completedGroups
        .map(group => wordSet.groups.findIndex(g => g.category === group.category))
        .filter(idx => idx !== -1); // Remove invalid indices

      const updateData: any = {
        current_player: updates.currentPlayer,
        selected_words: Array.from(updates.selectedWords),
        shaking_words: updates.shakingWords ? Array.from(updates.shakingWords) : [],
        show_almost_right_hint: updates.showAlmostRightHint !== undefined ? updates.showAlmostRightHint : false,
        completed_groups: completedGroupIndices,
        last_activity: new Date().toISOString(),
      };

      if (updates.status) {
        updateData.status = updates.status;
      }

      if (updates.winner !== undefined) {
        updateData.winner = updates.winner;
      }

      if (updates.status === 'completed' && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', sessionIdRef.current);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update remote state:', err);
      isUpdatingRef.current = false;
    }
  }, [wordSet]);

  const toggleWordSelection = useCallback((word: string) => {
    setState((prev) => {
      if (!prev || prev.status !== 'playing' || !prev.isMyTurn) return prev;

      // Check if word is already in a completed group
      const isCompleted = prev.completedGroups.some((g) =>
        g.words.includes(word)
      );
      if (isCompleted) return prev;

      const newSelected = new Set(prev.selectedWords);

      if (newSelected.has(word)) {
        // Deselecting - don't switch turn
        newSelected.delete(word);

        // Update local state
        const newState = {
          ...prev,
          selectedWords: newSelected,
        };

        // Update remote
        updateRemoteState({
          currentPlayer: prev.currentPlayer,
          selectedWords: newSelected,
          completedGroups: prev.completedGroups,
        });

        return newState;
      } else if (newSelected.size < 4) {
        // Adding word
        newSelected.add(word);

        // Switch turn UNLESS we now have 4 words (then current player decides)
        const shouldSwitchTurn = newSelected.size < 4;
        const newCurrentPlayer = shouldSwitchTurn
          ? (prev.currentPlayer === 1 ? 2 : 1)
          : prev.currentPlayer;

        // Update local state (optimistic)
        const newState = {
          ...prev,
          selectedWords: newSelected,
          currentPlayer: newCurrentPlayer,
          isMyTurn: newCurrentPlayer === prev.localPlayerNumber,
        };

        // Update remote
        updateRemoteState({
          currentPlayer: newCurrentPlayer,
          selectedWords: newSelected,
          completedGroups: prev.completedGroups,
        });

        return newState;
      }

      return prev;
    });
  }, [updateRemoteState]);

  const guessGroup = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.status !== 'playing' || !prev.isMyTurn) return prev;
      if (prev.selectedWords.size !== 4) return prev;

      const selectedArray = Array.from(prev.selectedWords);

      // Check if selected words form a correct group
      const correctGroup = prev.groups.find(
        (group) =>
          group.words.every((w) => selectedArray.includes(w)) &&
          selectedArray.length === 4
      );

      if (correctGroup) {
        // Correct guess!
        const newCompleted = [...prev.completedGroups, correctGroup];
        const hasWon = newCompleted.length === 4;
        const newCurrentPlayer: 1 | 2 = prev.currentPlayer === 1 ? 2 : 1;

        const newState = {
          ...prev,
          completedGroups: newCompleted,
          selectedWords: new Set<string>(),
          status: hasWon ? ('won' as const) : ('playing' as const),
          currentPlayer: newCurrentPlayer,
          isMyTurn: newCurrentPlayer === prev.localPlayerNumber,
          winner: hasWon ? null : prev.winner, // Both win together
        };

        // Update remote
        updateRemoteState({
          currentPlayer: newCurrentPlayer,
          selectedWords: new Set(),
          completedGroups: newCompleted,
          status: hasWon ? 'completed' : 'playing',
          winner: hasWon ? null : undefined,
        });

        return newState;
      } else {
        // Incorrect guess - check if 3/4 are correct
        const shakingWords = new Set(prev.selectedWords);
        const keptSelection = new Set(prev.selectedWords);
        const newCurrentPlayer: 1 | 2 = prev.currentPlayer === 1 ? 2 : 1;

        // Check if 3 out of 4 words are in any group
        let has3Correct = false;
        for (const group of prev.groups) {
          const correctCount = selectedArray.filter(w => group.words.includes(w)).length;
          if (correctCount === 3) {
            has3Correct = true;
            break;
          }
        }

        // Clear shake and hint after animation (both local and remote)
        setTimeout(() => {
          setState((current) => {
            if (!current) return current;
            return {
              ...current,
              shakingWords: new Set(),
              showAlmostRightHint: false,
            };
          });

          // Clear shake and hint in remote
          updateRemoteState({
            currentPlayer: newCurrentPlayer,
            selectedWords: keptSelection,
            shakingWords: new Set(),
            showAlmostRightHint: false,
            completedGroups: prev.completedGroups,
          });
        }, 2000);

        const newState = {
          ...prev,
          selectedWords: keptSelection,
          shakingWords,
          showAlmostRightHint: has3Correct,
          currentPlayer: newCurrentPlayer,
          isMyTurn: newCurrentPlayer === prev.localPlayerNumber,
        };

        // Update remote with shake and hint
        updateRemoteState({
          currentPlayer: newCurrentPlayer,
          selectedWords: keptSelection,
          shakingWords,
          showAlmostRightHint: has3Correct,
          completedGroups: prev.completedGroups,
        });

        return newState;
      }
    });
  }, [updateRemoteState]);

  const passTurn = useCallback(() => {
    setState((prev) => {
      if (!prev || !prev.isMyTurn) return prev;

      const newCurrentPlayer: 1 | 2 = prev.currentPlayer === 1 ? 2 : 1;

      const newState = {
        ...prev,
        currentPlayer: newCurrentPlayer,
        isMyTurn: false,
      };

      // Update remote
      updateRemoteState({
        currentPlayer: newCurrentPlayer,
        selectedWords: prev.selectedWords,
        completedGroups: prev.completedGroups,
      });

      return newState;
    });
  }, [updateRemoteState]);

  const clearSelection = useCallback(() => {
    setState((prev) => {
      if (!prev || !prev.isMyTurn) return prev;

      const newState = {
        ...prev,
        selectedWords: new Set<string>(),
      };

      // Update remote
      updateRemoteState({
        currentPlayer: prev.currentPlayer,
        selectedWords: new Set(),
        completedGroups: prev.completedGroups,
      });

      return newState;
    });
  }, [updateRemoteState]);

  const giveUp = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;

      // Set status to given_up locally only (don't sync to DB)
      // This prevents it from being overwritten by Realtime sync
      return {
        ...prev,
        status: 'given_up' as const,
      };
    });
  }, []);

  return {
    state,
    error,
    rematchSessionCode,
    toggleWordSelection,
    guessGroup,
    passTurn,
    clearSelection,
    giveUp,
  };
}
