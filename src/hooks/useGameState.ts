import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, WordSet } from '../types';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function initGame(wordSet: WordSet): GameState {
  // Get all words and shuffle them randomly
  const allWordsOrdered = wordSet.groups.flatMap((g) => g.words);
  const allWords = shuffleArray(allWordsOrdered);

  return {
    groups: wordSet.groups,
    allWords,
    currentPlayer: 1,
    completedGroups: [],
    selectedWords: new Set(),
    status: 'playing',
    shakingWords: new Set(),
  };
}

export function useGameState(wordSet: WordSet) {
  const [state, setState] = useState<GameState>(() => initGame(wordSet));
  const prevWordSetIdRef = useRef<string>(wordSet.id);

  // Reset game state only when wordSet ID actually changes (skip initial mount)
  useEffect(() => {
    if (prevWordSetIdRef.current !== wordSet.id) {
      setState(initGame(wordSet));
      prevWordSetIdRef.current = wordSet.id;
    }
  }, [wordSet.id, wordSet]);

  const toggleWordSelection = useCallback((word: string) => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev;

      // Check if word is already in a completed group
      const isCompleted = prev.completedGroups.some((g) =>
        g.words.includes(word)
      );
      if (isCompleted) return prev;

      const newSelected = new Set(prev.selectedWords);

      if (newSelected.has(word)) {
        // Deselecting - don't switch turn
        newSelected.delete(word);
        return {
          ...prev,
          selectedWords: newSelected,
        };
      } else if (newSelected.size < 4) {
        // Adding word
        newSelected.add(word);

        // Switch turn UNLESS we now have 4 words (then current player decides)
        const shouldSwitchTurn = newSelected.size < 4;

        return {
          ...prev,
          selectedWords: newSelected,
          currentPlayer: shouldSwitchTurn
            ? (prev.currentPlayer === 1 ? 2 : 1)
            : prev.currentPlayer,
        };
      }

      return prev;
    });
  }, []);

  const guessGroup = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev;
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

        return {
          ...prev,
          completedGroups: newCompleted,
          selectedWords: new Set(),
          status: hasWon ? 'won' : 'playing',
          // Switch turn after correct guess
          currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        };
      } else {
        // Incorrect guess - just shake and switch turn
        const shakingWords = new Set(prev.selectedWords);

        // Clear shake after animation
        setTimeout(() => {
          setState((current) => ({
            ...current,
            shakingWords: new Set(),
          }));
        }, 500);

        return {
          ...prev,
          selectedWords: new Set(),
          shakingWords,
          // Switch turn after incorrect guess
          currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        };
      }
    });
  }, []);

  const passTurn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedWords: new Set(),
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initGame(wordSet));
  }, [wordSet]);

  return {
    state,
    toggleWordSelection,
    guessGroup,
    passTurn,
    clearSelection,
    resetGame,
  };
}
