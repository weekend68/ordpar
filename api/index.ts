import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import wordSetsRouter from './_lib/routes/wordsets.js';
import gamesRouter from './_lib/routes/games.js';
import pairsRouter from './_lib/routes/pairs.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wordsets', wordSetsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/pairs', pairsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel serverless
export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
