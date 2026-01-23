import express from 'express';
import { generateValidatedWordSet } from '../services/ai/orchestrator.js';
import { saveWordSet, getRandomWordSet } from '../services/supabase/wordSets.js';
import { DifficultyProfile } from '../types.js';

const router = express.Router();

// Generate a new word set
router.post('/generate', async (req, res) => {
  try {
    const {
      difficulty_level = 'MEDEL',
      player_profile,
      bad_patterns = []
    } = req.body;

    // Default profile if not provided
    const defaultProfile: DifficultyProfile = {
      ordförråd: 'medel',
      ordlekar: 'medel',
      kulturella_referenser: 'medel',
      abstrakt_tänkande: 'medel'
    };

    const profile = player_profile || defaultProfile;

    console.log(`\n📥 Received generate request:`);
    console.log(`   Difficulty: ${difficulty_level}`);
    console.log(`   Profile:`, profile);
    console.log(`   Bad patterns: ${bad_patterns.length}`);

    // Try to use cached word set first (fast, <1s)
    const cached = await getRandomWordSet(difficulty_level);

    let groups;
    let wordSetId;

    if (cached) {
      console.log(`💾 Using cached word set: ${cached.id}`);
      groups = cached.groups;
      wordSetId = cached.id;
    } else {
      console.log(`🎲 No cache, generating new word set...`);
      // Generate word set (slow, 10-20s)
      groups = await generateValidatedWordSet(
        difficulty_level,
        profile,
        bad_patterns
      );

      // Save to database
      wordSetId = await saveWordSet(difficulty_level, groups);
    }

    res.json({
      success: true,
      word_set: {
        id: wordSetId,
        groups,
        difficulty_level,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generating word set:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
