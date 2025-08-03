// Shared scoring configuration and utility functions

export const SCORING_CONFIG = {
  points: { delivered: 1, opened: 3, clicked: 10 },
  temperature: { hot: 50, warm: 20, cold: 0 },
  decay: { dailyDecayRate: 0.02, maxDaysWithoutActivity: 30 },
} as const;

export function applyTimeDecay(
  rawScore: number,
  lastEngagementTimestamp: number,
): number {
  const now = Date.now();
  const daysSinceLastActivity =
    (now - lastEngagementTimestamp) / (24 * 60 * 60 * 1000);

  if (daysSinceLastActivity > SCORING_CONFIG.decay.maxDaysWithoutActivity)
    return 0;

  const decayFactor = Math.pow(
    1 - SCORING_CONFIG.decay.dailyDecayRate,
    daysSinceLastActivity,
  );
  return rawScore * decayFactor;
}

export function getTemperature(score: number): "hot" | "warm" | "cold" {
  if (score >= SCORING_CONFIG.temperature.hot) return "hot";
  if (score >= SCORING_CONFIG.temperature.warm) return "warm";
  return "cold";
}
