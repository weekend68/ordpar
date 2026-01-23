import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateValidatedWordSet } from './services/ai/orchestrator.js';
import { saveWordSet } from './services/supabase/wordSets.js';
import type { DifficultyProfile } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ordpar-ai', timestamp: new Date().toISOString() });
});

// Generate word set (no timeout limit)
app.post('/generate', async (req, res) => {
  try {
    const {
      difficulty_level = 'MEDEL',
      player_profile,
      bad_patterns = []
    } = req.body;

    const defaultProfile: DifficultyProfile = {
      ordförråd: 'medel',
      ordlekar: 'medel',
      kulturella_referenser: 'medel',
      abstrakt_tänkande: 'medel'
    };

    const profile = player_profile || defaultProfile;

    console.log(`\n📥 AI Generation request:`);
    console.log(`   Difficulty: ${difficulty_level}`);
    console.log(`   Profile:`, profile);
    console.log(`   Bad patterns: ${bad_patterns.length}`);

    // Generate word set (can take 30-60s, no problem on Railway)
    const groups = await generateValidatedWordSet(
      difficulty_level,
      profile,
      bad_patterns
    );

    // Save to Supabase
    const wordSetId = await saveWordSet(difficulty_level, groups);

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

app.listen(PORT, () => {
  console.log(`🚂 Railway AI Service running on port ${PORT}`);
});
