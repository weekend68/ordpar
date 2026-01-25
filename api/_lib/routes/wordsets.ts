import express from 'express';
import { getRandomWordSet } from '../services/supabase/wordSets.js';
import { aggregateGroupFeedback, formatFeedbackForAI } from '../services/supabase/feedbackAggregator.js';
import { DifficultyProfile, WordGroup } from '../types.js';

interface RailwayResponse {
  success: boolean;
  word_set?: {
    id: string;
    groups: WordGroup[];
    difficulty_level: string;
    created_at: string;
    source?: 'gemini' | 'dn' | 'claude' | null;
  };
  error?: string;
}

const router = express.Router();

// Generate a new word set - NOW USES DN DATA ONLY
router.post('/generate', async (req, res) => {
  try {
    console.log(`\n📥 Received generate request - using DN data only`);

    // Get random DN word set (AI generation disabled)
    const dnWordSet = await getRandomWordSet();

    if (!dnWordSet) {
      throw new Error('No DN word sets available in database');
    }

    console.log(`📰 Using DN word set: ${dnWordSet.id} (published: ${dnWordSet.created_at})`);

    res.json({
      success: true,
      word_set: {
        id: dnWordSet.id,
        groups: dnWordSet.groups,
        source: 'dn',
        created_at: dnWordSet.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error getting word set:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
