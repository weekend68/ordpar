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

// Generate a new word set
router.post('/generate', async (req, res) => {
  try {
    const {
      player_profile
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
    console.log(`   Profile:`, profile);

    // Try to use cached word set first (fast, <1s)
    const cached = await getRandomWordSet();

    let groups;
    let wordSetId;
    let source: 'gemini' | 'dn' | 'claude' | null = null;

    if (cached) {
      console.log(`💾 Using cached word set: ${cached.id}`);
      groups = cached.groups;
      wordSetId = cached.id;
      source = cached.source || null;
    } else {
      console.log(`🚂 No cache, calling Railway AI service...`);

      // Feedback disabled - was causing quality degradation
      // TODO: Re-enable when we have better quality control (threshold of 3+ ratings)
      // const aggregatedFeedback = await aggregateGroupFeedback();
      // const feedbackForPrompt = formatFeedbackForAI(aggregatedFeedback);
      // console.log(`📊 Sending aggregated feedback to AI (${aggregatedFeedback.excellent.length + aggregatedFeedback.good.length + aggregatedFeedback.too_easy.length + aggregatedFeedback.bad.length} examples)`);

      // Call Railway for generation (no timeout limit)
      const railwayUrl = process.env.RAILWAY_AI_URL || 'http://localhost:3002';
      const response = await fetch(`${railwayUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_profile: profile,
          feedback: '' // No feedback for now
        })
      });

      if (!response.ok) {
        throw new Error(`Railway AI service error: ${response.status}`);
      }

      const data = await response.json() as RailwayResponse;
      if (!data.success || !data.word_set) {
        throw new Error(data.error || 'Railway generation failed');
      }

      groups = data.word_set.groups;
      wordSetId = data.word_set.id;
      source = data.word_set.source || 'gemini'; // Default to gemini for new AI generations
    }

    res.json({
      success: true,
      word_set: {
        id: wordSetId,
        groups,
        source,
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
