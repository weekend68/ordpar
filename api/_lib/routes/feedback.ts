import express from 'express';
import { submitGroupFeedback } from '../services/supabase/feedback.js';

const router = express.Router();

export type GroupRating = 'excellent' | 'good' | 'too_easy' | 'bad';

interface FeedbackRequest {
  word_set_id: string;
  ratings: {
    group_index: number;
    rating: GroupRating;
  }[];
}

// Submit feedback for a word set
router.post('/submit', async (req, res) => {
  try {
    const { word_set_id, ratings } = req.body as FeedbackRequest;

    if (!word_set_id || !ratings || !Array.isArray(ratings)) {
      return res.status(400).json({
        success: false,
        error: 'Missing word_set_id or ratings',
      });
    }

    console.log(`📊 Feedback for word set ${word_set_id}:`, ratings);

    await submitGroupFeedback(word_set_id, ratings);

    res.json({
      success: true,
      message: 'Feedback saved',
    });
  } catch (error) {
    console.error('❌ Error saving feedback:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
