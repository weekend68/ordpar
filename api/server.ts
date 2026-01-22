// Local development server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wordSetsRouter from './routes/wordsets.js';
import gamesRouter from './routes/games.js';
import pairsRouter from './routes/pairs.js';

// Load env from backend/.env
dotenv.config({ path: '../backend/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api`);
});
