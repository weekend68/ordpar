import express from 'express';
import { createPair, getPair, updatePairDifficulty } from '../services/supabase/pairs.js';
import { createUser } from '../services/supabase/users.js';

const router = express.Router();

// Create a new pair (and users if needed)
router.post('/create', async (req, res) => {
  try {
    const {
      player1_name,
      player2_name,
      difficulty_profile
    } = req.body;

    if (!player1_name || !player2_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing player names'
      });
    }

    // Create users
    const player1Id = await createUser(player1_name);
    const player2Id = await createUser(player2_name);

    // Create pair
    const pairId = await createPair(player1Id, player2Id, difficulty_profile);

    res.json({
      success: true,
      pair_id: pairId,
      player1_id: player1Id,
      player2_id: player2Id
    });

  } catch (error) {
    console.error('❌ Error creating pair:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get pair by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pair = await getPair(id);

    if (!pair) {
      return res.status(404).json({
        success: false,
        error: 'Pair not found'
      });
    }

    res.json({
      success: true,
      pair
    });

  } catch (error) {
    console.error('❌ Error getting pair:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update pair difficulty
router.post('/:id/difficulty', async (req, res) => {
  try {
    const { id } = req.params;
    const { difficulty_profile } = req.body;

    if (!difficulty_profile) {
      return res.status(400).json({
        success: false,
        error: 'Missing difficulty_profile'
      });
    }

    await updatePairDifficulty(id, difficulty_profile);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('❌ Error updating pair difficulty:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
