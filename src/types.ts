export type Difficulty = 'easy' | 'mixed' | 'hard';

export interface StudySession {
  id: string;
  date: string;
  totalMinutes: number;
  reviewedCards: number;
  newCards: number;
  difficulty: Difficulty;
  createdAt: number;
}

export interface PlannerSettings {
  budgetMinutes: number;
  dueReviews: number;
  reviewSeconds: number;
  difficulty: Difficulty;
  newCardSeconds: number | null;
}

export interface PlannerState {
  version: 1;
  updatedAt: number;
  settings: PlannerSettings;
  sessions: StudySession[];
}

export interface Recommendation {
  cap: number;
  rangeLow: number;
  rangeHigh: number;
  reviewMinutes: number;
  availableMinutes: number;
  expectedMinutes: number;
  secondsPerNew: number;
  uncertaintySeconds: number;
  sampleCount: number;
  confidence: 'starter' | 'learning' | 'personal' | 'manual';
  reason: string;
}
