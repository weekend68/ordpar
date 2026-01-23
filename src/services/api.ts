import { WordGroup } from '../types';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

interface GenerateWordSetRequest {
  player_profile?: {
    ordförråd: 'lätt' | 'medel' | 'avancerat';
    ordlekar: 'undvik' | 'medel' | 'älskar';
    kulturella_referenser: 'kända' | 'medel' | 'obskyra';
    abstrakt_tänkande: 'konkret' | 'medel' | 'abstrakt';
  };
}

interface GenerateWordSetResponse {
  success: boolean;
  word_set?: {
    id: string;
    groups: WordGroup[];
    created_at: string;
  };
  error?: string;
}

export async function generateWordSet(
  request: GenerateWordSetRequest = {}
): Promise<{ id: string; groups: WordGroup[] }> {
  const url = `${API_URL}/wordsets/generate`;
  console.log('🌐 Fetching from:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GenerateWordSetResponse = await response.json();

    if (!data.success || !data.word_set) {
      throw new Error(data.error || 'Failed to generate word set');
    }

    return {
      id: data.word_set.id,
      groups: data.word_set.groups,
    };
  } catch (error) {
    console.error('🚨 Fetch error:', error);
    throw error;
  }
}

export type GroupRating = 'excellent' | 'good' | 'too_easy' | 'bad';

interface FeedbackRequest {
  word_set_id: string;
  ratings: {
    group_index: number;
    rating: GroupRating;
  }[];
}

interface FeedbackResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitFeedback(
  wordSetId: string,
  ratings: Map<number, GroupRating>
): Promise<void> {
  const ratingsArray = Array.from(ratings.entries()).map(([group_index, rating]) => ({
    group_index,
    rating,
  }));

  const request: FeedbackRequest = {
    word_set_id: wordSetId,
    ratings: ratingsArray,
  };

  console.log('📤 Submitting feedback:', request);

  const response = await fetch(`${API_URL}/feedback/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: FeedbackResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to submit feedback');
  }

  console.log('✅ Feedback submitted successfully');
}
