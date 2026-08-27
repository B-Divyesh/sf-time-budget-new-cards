import type { Difficulty, PlannerSettings, Recommendation, StudySession } from './types';

export const difficultyFactor: Record<Difficulty, number> = {
  easy: 0.72,
  mixed: 1,
  hard: 1.48,
};

const FALLBACK_SECONDS = 58;

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

export function estimate(settings: PlannerSettings, sessions: StudySession[]): Recommendation {
  const budget = Math.max(1, finite(settings.budgetMinutes, 15));
  const reviewSeconds = Math.max(1, finite(settings.reviewSeconds, 9));
  const due = Math.max(0, Math.floor(finite(settings.dueReviews)));
  const factor = difficultyFactor[settings.difficulty];
  const usable = [...sessions]
    .sort((left, right) => right.createdAt - left.createdAt)
    .filter((session) => session.newCards > 0 && session.totalMinutes > 0)
    .map((session) => {
      const marginal = (session.totalMinutes * 60 - session.reviewedCards * reviewSeconds) / session.newCards;
      return marginal / difficultyFactor[session.difficulty];
    })
    .filter((seconds) => seconds >= 8 && seconds <= 600)
    .slice(0, 30);

  let baseSeconds = FALLBACK_SECONDS;
  if (usable.length) {
    let weightTotal = 0;
    let weightedTotal = 0;
    usable.forEach((value, index) => {
      const weight = Math.pow(0.94, index);
      weightedTotal += value * weight;
      weightTotal += weight;
    });
    baseSeconds = weightedTotal / weightTotal;
  }

  const manualSeconds = settings.newCardSeconds && settings.newCardSeconds > 0 ? settings.newCardSeconds : null;
  const secondsPerNew = manualSeconds || Math.max(12, baseSeconds * factor);
  let variability = secondsPerNew * 0.32;
  if (manualSeconds) {
    variability = secondsPerNew * 0.15;
  } else if (usable.length >= 2) {
    const adjusted = usable.map((value) => value * factor);
    const variance = adjusted.reduce((sum, value) => sum + Math.pow(value - secondsPerNew, 2), 0) / (adjusted.length - 1);
    variability = Math.max(secondsPerNew * 0.14, Math.sqrt(variance));
  } else if (usable.length === 1) {
    variability = secondsPerNew * 0.24;
  }

  const uncertaintySeconds = Math.min(secondsPerNew * 0.55, variability);
  const reviewMinutes = (due * reviewSeconds) / 60;
  const availableMinutes = Math.max(0, budget - reviewMinutes);
  const upperCost = secondsPerNew + uncertaintySeconds;
  const lowerCost = Math.max(10, secondsPerNew - uncertaintySeconds);
  const cap = Math.max(0, Math.floor((availableMinutes * 60) / upperCost));
  const rangeHigh = Math.max(cap, Math.floor((availableMinutes * 60) / lowerCost));
  const expectedMinutes = reviewMinutes + (cap * secondsPerNew) / 60;
  const confidence = manualSeconds ? 'manual' : usable.length >= 7 ? 'personal' : usable.length >= 2 ? 'learning' : 'starter';

  let reason = `${due} due reviews use about ${reviewMinutes.toFixed(1)} of ${budget} minutes.`;
  if (reviewMinutes >= budget) {
    reason = `Due reviews already fill the ${budget}-minute budget, so adding zero is the safer call.`;
  }

  return {
    cap,
    rangeLow: cap,
    rangeHigh,
    reviewMinutes,
    availableMinutes,
    expectedMinutes,
    secondsPerNew,
    uncertaintySeconds,
    sampleCount: usable.length,
    confidence,
    reason,
  };
}
