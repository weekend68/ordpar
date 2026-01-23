import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateValidatedWordSet } from './services/ai/orchestrator.js';
import { saveWordSet } from './services/supabase/wordSets.js';
import type { DifficultyProfile } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from railway directory (one level up from dist)
dotenv.config({ path: path.join(__dirname, '../.env') });

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
      player_profile,
      feedback = ''
    } = req.body;

    const defaultProfile: DifficultyProfile = {
      ordförråd: 'medel',
      ordlekar: 'medel',
      kulturella_referenser: 'medel',
      abstrakt_tänkande: 'medel'
    };

    const profile = player_profile || defaultProfile;

    console.log(`\n📥 AI Generation request:`);
    console.log(`   Profile:`, profile);
    console.log(`   Feedback: ${feedback ? 'Yes' : 'No feedback yet'}`);

    // Generate word set (can take 30-60s, no problem on Railway)
    const groups = await generateValidatedWordSet(
      profile,
      feedback
    );

    // Save to Supabase
    const wordSetId = await saveWordSet(groups);

    res.json({
      success: true,
      word_set: {
        id: wordSetId,
        groups,
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
