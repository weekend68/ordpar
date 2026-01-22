import express from 'express';
import { createGame, getGame, updateGameMoves, completeGame, saveGameFeedback, getPairGames } from '../services/supabase/games.js';

const router = express.Router();

// Create a new game
router.post('/create', async (req, res) => {
  try {
    const {
      pair_id,
      word_set_id,
      player1_words,
      player2_words,
      difficulty_level
    } = req.body;

    if (!pair_id || !word_set_id || !player1_words || !player2_words || !difficulty_level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const gameId = await createGame(
      pair_id,
      word_set_id,
      player1_words,
      player2_words,
      difficulty_level
    );

    res.json({
      success: true,
      game_id: gameId
    });

  } catch (error) {
    console.error('❌ Error creating game:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const game = await getGame(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    res.json({
      success: true,
      game
    });

  } catch (error) {
    console.error('❌ Error getting game:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update game moves
router.post('/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { moves } = req.body;

    if (!moves) {
      return res.status(400).json({
        success: false,
        error: 'Missing moves'
      });
    }

    await updateGameMoves(id, moves);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('❌ Error updating moves:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Complete a game
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { result, score, attempts_used } = req.body;

    if (!result || score === undefined || attempts_used === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    await completeGame(id, result, score, attempts_used);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('❌ Error completing game:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Save feedback
router.post('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      feedback_difficulty_p1,
      feedback_difficulty_p2,
      feedback_quality,
      feedback_bad_group
    } = req.body;

    await saveGameFeedback(
      id,
      feedback_difficulty_p1 || null,
      feedback_difficulty_p2 || null,
      feedback_quality || null,
      feedback_bad_group || null
    );

    res.json({
      success: true
    });

  } catch (error) {
    console.error('❌ Error saving feedback:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all games for a pair
router.get('/pair/:pairId', async (req, res) => {
  try {
    const { pairId } = req.params;

    const games = await getPairGames(pairId);

    res.json({
      success: true,
      games
    });

  } catch (error) {
    console.error('❌ Error getting pair games:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
