export interface WordGroup {
  category: string;
  words: string[];
  difficulty: 'uppenbar' | 'tänkvärd' | 'knepig';
  type: 'konkret' | 'abstrakt' | 'ordlek' | 'kulturell';
  explanation: string;
}

export interface GeneratedWordSet {
  groups: WordGroup[];
}

export interface ValidationIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affected_groups: number[];
  affected_words: string[];
  suggestion?: string;
}

export interface GroupQuality {
  group_index: number;
  quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  comment: string;
  comparison?: string;
}

export interface ValidationResult {
  valid: boolean;
  overall_quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  issues: ValidationIssue[];
  recommendations: string[];
  group_quality: GroupQuality[];
}

export interface DifficultyProfile {
  ordförråd: 'lätt' | 'medel' | 'avancerat';
  ordlekar: 'undvik' | 'medel' | 'älskar';
  kulturella_referenser: 'kända' | 'medel' | 'obskyra';
  abstrakt_tänkande: 'konkret' | 'medel' | 'abstrakt';
}

export interface WordSet {
  id: string;
  difficulty_level: 'LÄTT' | 'MEDEL' | 'SVÅR' | 'EXPERT';
  groups: WordGroup[];
  quality_score?: number;
  times_used: number;
  used_by_user_ids: string[];
  created_at: string;
}

export interface Game {
  id: string;
  word_set_id: string;
  current_player: 1 | 2;
  completed_groups: WordGroup[];
  selected_words: string[];
  status: 'playing' | 'won';
  created_at: string;
}
