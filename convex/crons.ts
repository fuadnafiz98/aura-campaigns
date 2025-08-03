import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "daily lead scoring update",
  { hourUTC: 2, minuteUTC: 0 },
  internal.leadScoringWorkers.batchUpdateAllLeadScores,
);

crons.hourly(
  "apply scoring decay",
  { minuteUTC: 0 },
  internal.leadScoringWorkers.applyDecayToAllScores,
);

export default crons;
