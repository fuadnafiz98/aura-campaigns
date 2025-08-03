import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "daily lead scoring update",
  { hourUTC: 2, minuteUTC: 0 },
  internal.leadScoringWorkers.batchUpdateAllLeadScores,
);

crons.hourly(
  "apply daily scoring decay",
  { minuteUTC: 0 },
  internal.leadScoringWorkers.applyDecayToAllScores,
);

// More frequent minute-level decay updates for recently active leads
crons.interval(
  "apply minute decay to active leads",
  { minutes: 15 },
  internal.leadScoringWorkers.applyMinuteDecayToActiveScores,
);

export default crons;
