import { describe, expect, it } from 'vitest';
import { estimate } from './calculator';
import type { PlannerSettings, StudySession } from './types';

const settings: PlannerSettings = {
  budgetMinutes: 20,
  dueReviews: 60,
  reviewSeconds: 10,
  difficulty: 'mixed',
  newCardSeconds: null,
};

describe('estimate', () => {
  it('uses a cautious starter estimate after reserving review time', () => {
    const result = estimate(settings, []);
    expect(result.reviewMinutes).toBe(10);
    expect(result.cap).toBe(7);
    expect(result.rangeHigh).toBeGreaterThan(result.cap);
    expect(result.confidence).toBe('starter');
  });

  it('does not recommend new cards when due reviews consume the budget', () => {
    const result = estimate({ ...settings, budgetMinutes: 5 }, []);
    expect(result.availableMinutes).toBe(0);
    expect(result.cap).toBe(0);
    expect(result.expectedMinutes).toBe(10);
  });

  it('learns marginal new-card time from session history', () => {
    const sessions: StudySession[] = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
      id: String(day),
      date: `2026-08-${String(day).padStart(2, '0')}`,
      totalMinutes: 20,
      reviewedCards: 60,
      newCards: 10,
      difficulty: 'mixed',
      createdAt: day,
    }));
    const result = estimate(settings, sessions);
    expect(result.secondsPerNew).toBeCloseTo(60);
    expect(result.sampleCount).toBe(7);
    expect(result.confidence).toBe('personal');
  });

  it('raises cost for hard material', () => {
    const easy = estimate({ ...settings, difficulty: 'easy' }, []);
    const hard = estimate({ ...settings, difficulty: 'hard' }, []);
    expect(hard.secondsPerNew).toBeGreaterThan(easy.secondsPerNew);
    expect(hard.cap).toBeLessThan(easy.cap);
  });

  it('honors a manual pace correction', () => {
    const result = estimate({ ...settings, newCardSeconds: 120 }, []);
    expect(result.secondsPerNew).toBe(120);
    expect(result.confidence).toBe('manual');
    expect(result.cap).toBe(4);
  });
});
