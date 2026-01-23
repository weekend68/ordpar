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
    shakingWords: new Set(),
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
        setState(initMultiplayerGame(wordSet, data.id, sessionCode, localPlayerNumber, data));
      } catch (err) {
        console.error('Failed to load session:', err);
        setError(err instanceof Error ? err.message : 'Failed to load session');
      }
    }

    loadSession();
  }, [sessionCode, wordSet, localPlayerNumber]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!sessionIdRef.current) return;

    console.log('🔌 Setting up Realtime subscription for:', sessionCode);

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
          console.log('🔄 Received real-time update:', payload);

          // Don't skip echo - just update state
          // The issue is that we need to see ALL updates

          // Sync remote state to local
          const session = payload.new as GameSession;
          setState((prev) => {
            if (!prev) return prev;

            console.log('Updating state from Realtime:', {
              status: session.status,
              current_player: session.current_player,
              selected_words: session.selected_words,
            });

            return {
              ...prev,
              currentPlayer: session.current_player,
              selectedWords: new Set(session.selected_words),
              completedGroups: session.completed_groups
                .map(idx => wordSet.groups[idx])
                .filter(g => g !== undefined), // Filter out invalid indices
              isMyTurn: session.current_player === localPlayerNumber,
              opponentConnected: session.status === 'playing' || session.status === 'completed',
              status: session.status === 'completed' ? 'won' : 'playing',
              winner: session.winner,
              lastActivity: new Date(session.last_activity),
            };
          });

          // Reset updating flag after a delay
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Unsubscribing from channel');
      supabase.removeChannel(channel);
    };
  }, [sessionCode, wordSet, localPlayerNumber]);

  // Update remote state
  const updateRemoteState = useCallback(async (updates: {
    currentPlayer: 1 | 2;
    selectedWords: Set<string>;
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

      console.log('✅ Updated remote state:', updateData);
    } catch (err) {
      console.error('❌ Failed to update remote state:', err);
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
        // Incorrect guess - shake but keep words selected for easy adjustment
        const shakingWords = new Set(prev.selectedWords);
        const newCurrentPlayer: 1 | 2 = prev.currentPlayer === 1 ? 2 : 1;

        // Clear shake after animation
        setTimeout(() => {
          setState((current) => {
            if (!current) return current;
            return {
              ...current,
              shakingWords: new Set(),
            };
          });
        }, 500);

        const newState = {
          ...prev,
          selectedWords: prev.selectedWords, // KEEP selected for adjustment
          shakingWords,
          currentPlayer: newCurrentPlayer,
          isMyTurn: newCurrentPlayer === prev.localPlayerNumber,
        };

        // Update remote
        updateRemoteState({
          currentPlayer: newCurrentPlayer,
          selectedWords: prev.selectedWords, // Keep selected words in sync
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

  return {
    state,
    error,
    toggleWordSelection,
    guessGroup,
    passTurn,
    clearSelection,
  };
}
