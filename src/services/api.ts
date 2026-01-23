import { WordGroup } from '../types';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

interface GenerateWordSetRequest {
  difficulty_level?: 'LÄTT' | 'MEDEL' | 'SVÅR' | 'EXPERT';
  player_profile?: {
    ordförråd: 'lätt' | 'medel' | 'avancerat';
    ordlekar: 'undvik' | 'medel' | 'älskar';
    kulturella_referenser: 'kända' | 'medel' | 'obskyra';
    abstrakt_tänkande: 'konkret' | 'medel' | 'abstrakt';
  };
  bad_patterns?: string[];
}

interface GenerateWordSetResponse {
  success: boolean;
  word_set?: {
    groups: WordGroup[];
    difficulty_level: string;
    created_at: string;
  };
  error?: string;
}

export async function generateWordSet(
  request: GenerateWordSetRequest = {}
): Promise<WordGroup[]> {
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

    return data.word_set.groups;
  } catch (error) {
    console.error('🚨 Fetch error:', error);
    throw error;
  }
}
