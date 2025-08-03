import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  SCORING_CONFIG,
  applyTimeDecay,
  getTemperature,
} from "./leadScoringUtils";

export const batchUpdateAllLeadScores = internalMutation({
  args: {},
  handler: async (ctx) => {
    const emailLogs = await ctx.db.query("emailLogs").collect();
    const uniqueLeadIds = [
      ...new Set(emailLogs.map((log) => log.leadId).filter(Boolean)),
    ] as string[];

    const batchSize = 50;

    for (let i = 0; i < uniqueLeadIds.length; i += batchSize) {
      const batch = uniqueLeadIds.slice(i, i + batchSize);

      await ctx.scheduler.runAfter(
        0,
        internal.leadScoringWorkers.processBatchOfLeads,
        {
          leadIds: batch as any[],
          batchNumber: Math.floor(i / batchSize) + 1,
          totalBatches: Math.ceil(uniqueLeadIds.length / batchSize),
        },
      );
    }

    return {
      totalLeads: uniqueLeadIds.length,
      batchesScheduled: Math.ceil(uniqueLeadIds.length / batchSize),
    };
  },
});

export const processBatchOfLeads = internalMutation({
  args: {
    leadIds: v.array(v.id("leads")),
    batchNumber: v.number(),
    totalBatches: v.number(),
  },
  handler: async (ctx, args) => {
    for (const leadId of args.leadIds) {
      try {
        await calculateLeadScoreInternal(ctx, leadId);
      } catch (error) {
        console.error(`Error calculating score for lead ${leadId}:`, error);
      }
    }
  },
});

async function calculateLeadScoreInternal(ctx: any, leadId: string) {
  const emailLogs = await ctx.db
    .query("emailLogs")
    .withIndex("byLead", (q: any) => q.eq("leadId", leadId))
    .collect();

  if (emailLogs.length === 0) return;

  const totalSent = emailLogs.length;
  const totalDelivered = emailLogs.filter((log: any) => log.deliveredAt).length;
  const totalOpened = emailLogs.filter((log: any) => log.openedAt).length;
  const totalClicked = emailLogs.filter((log: any) => log.clickedAt).length;

  const openRate =
    totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
  const clickRate =
    totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

  let rawScore = 0;
  rawScore += totalDelivered * SCORING_CONFIG.points.delivered;
  rawScore += totalOpened * SCORING_CONFIG.points.opened;
  rawScore += totalClicked * SCORING_CONFIG.points.clicked;

  const engagementActivities = emailLogs
    .filter((log: any) => log.openedAt || log.clickedAt)
    .map((log: any) => ({
      timestamp: Math.max(log.openedAt || 0, log.clickedAt || 0),
      type: log.clickedAt ? "clicked" : "opened",
    }))
    .sort((a: any, b: any) => b.timestamp - a.timestamp);

  const lastEngagement = engagementActivities[0];

  let finalScore = rawScore;
  if (lastEngagement) {
    finalScore = applyTimeDecay(rawScore, lastEngagement.timestamp);
  }

  const temperature = getTemperature(finalScore);

  const now = Date.now();
  const recentThreshold = now - 7 * 24 * 60 * 60 * 1000;
  const recentActivity = emailLogs.filter(
    (log: any) =>
      (log.openedAt && log.openedAt > recentThreshold) ||
      (log.clickedAt && log.clickedAt > recentThreshold),
  ).length;

  const olderActivity = emailLogs.filter(
    (log: any) =>
      (log.openedAt && log.openedAt <= recentThreshold) ||
      (log.clickedAt && log.clickedAt <= recentThreshold),
  ).length;

  let engagementTrend: string | undefined;
  if (recentActivity > olderActivity) engagementTrend = "increasing";
  else if (recentActivity < olderActivity) engagementTrend = "decreasing";
  else if (recentActivity > 0) engagementTrend = "stable";

  await upsertLeadScoreInternal(ctx, {
    leadId,
    hotScore: Math.round(finalScore),
    temperature,
    totalEmailsSent: totalSent,
    totalEmailsDelivered: totalDelivered,
    totalEmailsOpened: totalOpened,
    totalEmailsClicked: totalClicked,
    lastEngagementAt: lastEngagement?.timestamp,
    lastEngagementType: lastEngagement?.type,
    openRate: Math.round(openRate * 100) / 100,
    clickRate: Math.round(clickRate * 100) / 100,
    engagementTrend,
  });
}

export const applyDecayToAllScores = internalMutation({
  args: {},
  handler: async (ctx) => {
    const leadScores = await ctx.db.query("leadScores").collect();

    let updated = 0;
    const now = Date.now();

    for (const score of leadScores) {
      if (score.lastEngagementAt && score.hotScore > 0) {
        const daysSinceLastActivity =
          (now - score.lastEngagementAt) / (24 * 60 * 60 * 1000);

        if (
          daysSinceLastActivity > SCORING_CONFIG.decay.maxDaysWithoutActivity
        ) {
          await ctx.db.patch(score._id, {
            hotScore: 0,
            temperature: "cold",
            lastCalculatedAt: now,
          });
          updated++;
        } else if (daysSinceLastActivity > 1) {
          const decayFactor = Math.pow(
            1 - SCORING_CONFIG.decay.dailyDecayRate,
            daysSinceLastActivity,
          );
          const newScore = Math.round(score.hotScore * decayFactor);
          const newTemperature = getTemperature(newScore);

          if (newScore !== score.hotScore) {
            await ctx.db.patch(score._id, {
              hotScore: newScore,
              temperature: newTemperature,
              lastCalculatedAt: now,
            });
            updated++;
          }
        }
      }
    }

    return { totalProcessed: leadScores.length, updated };
  },
});

export const triggerLeadScoreUpdate = internalMutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await calculateLeadScoreInternal(ctx, args.leadId);
    return { success: true };
  },
});

async function upsertLeadScoreInternal(
  ctx: any,
  data: {
    leadId: string;
    hotScore: number;
    temperature: string;
    totalEmailsSent: number;
    totalEmailsDelivered: number;
    totalEmailsOpened: number;
    totalEmailsClicked: number;
    lastEngagementAt?: number;
    lastEngagementType?: string;
    openRate: number;
    clickRate: number;
    engagementTrend?: string;
  },
) {
  const existing = await ctx.db
    .query("leadScores")
    .withIndex("byLead", (q: any) => q.eq("leadId", data.leadId))
    .first();

  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, { ...data, lastCalculatedAt: now });
  } else {
    await ctx.db.insert("leadScores", { ...data, lastCalculatedAt: now });
  }
}
