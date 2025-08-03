// Shared scoring configuration and utility functions

export const SCORING_CONFIG = {
  points: { delivered: 1, opened: 2, clicked: 5 },
  temperature: { hot: 50, warm: 20, cold: 0 },
  decay: {
    minuteDecayRate: 0.001,
    dailyDecayRate: 0.05,
    maxDaysWithoutActivity: 30,
  },
} as const;

export function applyTimeDecay(
  rawScore: number,
  lastEngagementTimestamp: number,
  useMinuteDecay: boolean = false,
): number {
  const now = Date.now();
  const timeDiff = now - lastEngagementTimestamp;

  if (useMinuteDecay) {
    const minutesSinceLastActivity = timeDiff / (60 * 1000);
    const decayFactor = Math.pow(
      1 - SCORING_CONFIG.decay.minuteDecayRate,
      minutesSinceLastActivity,
    );
    return rawScore * decayFactor;
  }

  const daysSinceLastActivity = timeDiff / (24 * 60 * 60 * 1000);

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
