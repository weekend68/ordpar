import express from 'express';
import { getRandomWordSet } from '../services/supabase/wordSets.js';
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
      console.log(`🚂 No cache, calling Railway AI service...`);
      // Call Railway for generation (no timeout limit)
      const railwayUrl = process.env.RAILWAY_AI_URL || 'http://localhost:3002';
      const response = await fetch(`${railwayUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty_level,
          player_profile: profile,
          bad_patterns
        })
      });

      if (!response.ok) {
        throw new Error(`Railway AI service error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Railway generation failed');
      }

      groups = data.word_set.groups;
      wordSetId = data.word_set.id;
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
