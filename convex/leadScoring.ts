import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  SCORING_CONFIG,
  applyTimeDecay,
  getTemperature,
} from "./leadScoringUtils";

export const calculateLeadScore = mutation({
  args: {
    leadId: v.id("leads"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { leadId, userId } = args;

    const emailLogs = await ctx.db
      .query("emailLogs")
      .withIndex("byLead", (q) => q.eq("leadId", leadId))
      .collect();

    if (emailLogs.length === 0) {
      await upsertLeadScore(ctx, {
        leadId,
        hotScore: 0,
        temperature: "cold",
        totalEmailsSent: 0,
        totalEmailsDelivered: 0,
        totalEmailsOpened: 0,
        totalEmailsClicked: 0,
        lastEngagementAt: undefined,
        lastEngagementType: undefined,
        openRate: 0,
        clickRate: 0,
        engagementTrend: undefined,
        calculatedBy: userId,
      });
      return { score: 0, temperature: "cold" };
    }

    const totalSent = emailLogs.length;
    const totalDelivered = emailLogs.filter((log) => log.deliveredAt).length;
    const totalOpened = emailLogs.reduce(
      (sum, log) => sum + (log.openCount || 0),
      0,
    );
    const totalClicked = emailLogs.reduce(
      (sum, log) => sum + (log.clickCount || 0),
      0,
    );

    const openRate =
      totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate =
      totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

    let rawScore = 0;
    rawScore += totalDelivered * SCORING_CONFIG.points.delivered;
    rawScore += totalOpened * SCORING_CONFIG.points.opened;
    rawScore += totalClicked * SCORING_CONFIG.points.clicked;

    const engagementActivities = emailLogs
      .filter((log) => log.openedAt || log.clickedAt)
      .map((log) => ({
        timestamp: Math.max(log.openedAt || 0, log.clickedAt || 0),
        type: log.clickedAt ? "clicked" : "opened",
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    const lastEngagement = engagementActivities[0];

    let finalScore = rawScore;
    if (lastEngagement) {
      finalScore = applyTimeDecay(rawScore, lastEngagement.timestamp);
    }

    const temperature = getTemperature(finalScore);

    const now = Date.now();
    const recentThreshold = now - 7 * 24 * 60 * 60 * 1000;
    const recentActivity = emailLogs.reduce((sum, log) => {
      let count = 0;
      if (log.openedAt && log.openedAt > recentThreshold) {
        count += log.openCount || 0;
      }
      if (log.clickedAt && log.clickedAt > recentThreshold) {
        count += log.clickCount || 0;
      }
      return sum + count;
    }, 0);

    const olderActivity = emailLogs.reduce((sum, log) => {
      let count = 0;
      if (log.openedAt && log.openedAt <= recentThreshold) {
        count += log.openCount || 0;
      }
      if (log.clickedAt && log.clickedAt <= recentThreshold) {
        count += log.clickCount || 0;
      }
      return sum + count;
    }, 0);

    let engagementTrend: string | undefined;
    if (recentActivity > olderActivity) engagementTrend = "increasing";
    else if (recentActivity < olderActivity) engagementTrend = "decreasing";
    else if (recentActivity > 0) engagementTrend = "stable";

    await upsertLeadScore(ctx, {
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
      calculatedBy: userId,
    });

    return {
      score: Math.round(finalScore),
      temperature,
      metrics: {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        openRate,
        clickRate,
        engagementTrend,
      },
    };
  },
});

async function upsertLeadScore(
  ctx: any,
  data: {
    leadId: Id<"leads">;
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
    calculatedBy?: Id<"users">;
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

export const getLeadScore = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leadScores")
      .withIndex("byLead", (q) => q.eq("leadId", args.leadId))
      .first();
  },
});

export const getHotLeads = query({
  args: {
    limit: v.optional(v.number()),
    temperature: v.optional(v.string()),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get lead scores based on temperature filter
    let leadScores;
    if (args.temperature) {
      leadScores = await ctx.db
        .query("leadScores")
        .withIndex("byTemperature", (q: any) =>
          q.eq("temperature", args.temperature),
        )
        .order("desc")
        .take(limit * 2); // Get more to account for campaign filtering
    } else {
      leadScores = await ctx.db
        .query("leadScores")
        .withIndex("byHotScore")
        .order("desc")
        .take(limit * 2); // Get more to account for campaign filtering
    }

    const results = await Promise.all(
      leadScores.map(async (score) => {
        const lead = await ctx.db.get(score.leadId);
        if (!lead) return null;

        // If campaign filter is provided, check if lead has activity in that campaign
        if (args.campaignId) {
          const hasActivityInCampaign = await ctx.db
            .query("emailLogs")
            .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
            .filter((q) => q.eq(q.field("leadId"), score.leadId))
            .first();

          if (!hasActivityInCampaign) return null;
        }

        return {
          ...lead,
          score: score.hotScore,
          temperature: score.temperature,
        };
      }),
    );

    const filteredResults = results.filter((lead) => lead !== null);

    // Sort by score and take the final limit
    return filteredResults.sort((a, b) => b.score - a.score).slice(0, limit);
  },
});

export const getLeadLatestActivity = query({
  args: {
    leadId: v.id("leads"),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    let emailLogs;

    if (args.campaignId) {
      // Get logs for specific campaign
      emailLogs = await ctx.db
        .query("emailLogs")
        .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
        .filter((q) => q.eq(q.field("leadId"), args.leadId))
        .collect();
    } else {
      // Get all logs for this lead
      emailLogs = await ctx.db
        .query("emailLogs")
        .withIndex("byLead", (q) => q.eq("leadId", args.leadId))
        .collect();
    }

    if (emailLogs.length === 0) {
      return {
        hasActivity: false,
        latestActivityTime: null,
        latestActivityType: null,
        latestEmailSubject: null,
      };
    }

    // Find the most recent log by updatedAt
    const latestLog = emailLogs.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    console.log("LATEST", latestLog);

    // Determine what the latest activity was based on timestamps (most recent wins)
    let latestActivityType = null;
    let latestActivityTime = null;

    // Collect all possible activities with their timestamps
    const activities = [];

    if (latestLog.clickedAt) {
      activities.push({
        type: "clicked",
        time: latestLog.lastClickedAt || latestLog.clickedAt,
      });
    }

    if (latestLog.openedAt) {
      activities.push({
        type: "opened",
        time: latestLog.lastOpenedAt || latestLog.openedAt,
      });
    }

    if (latestLog.deliveredAt) {
      activities.push({
        type: "delivered",
        time: latestLog.deliveredAt,
      });
    }

    if (latestLog.status === "sent") {
      activities.push({
        type: "sent",
        time: latestLog.createdAt,
      });
    }

    // If no specific activities, use the status and updatedAt
    if (activities.length === 0) {
      latestActivityType = latestLog.status; // failed, bounced, etc.
      latestActivityTime = latestLog.updatedAt;
    } else {
      // Find the activity with the most recent timestamp
      const mostRecentActivity = activities.sort((a, b) => b.time - a.time)[0];
      latestActivityType = mostRecentActivity.type;
      latestActivityTime = mostRecentActivity.time;
    }

    return {
      hasActivity: true,
      latestActivityTime,
      latestActivityType,
      latestEmailSubject: latestLog.subject,
      totalOpenCount: latestLog.openCount || 0,
      totalClickCount: latestLog.clickCount || 0,
      campaignName: latestLog.campaignId
        ? (await ctx.db.get(latestLog.campaignId))?.name
        : null,
    };
  },
});

// export const getHotLeads = query({
//   args: {
//     limit: v.optional(v.number()),
//     temperature: v.optional(v.string()),
//     campaignId: v.optional(v.id("campaigns")),
//   },
//   handler: async (ctx, args) => {
//     const limit = args.limit || 50;

//     let leadScores;
//     if (args.temperature) {
//       leadScores = await ctx.db
//         .query("leadScores")
//         .withIndex("byTemperature", (q: any) =>
//           q.eq("temperature", args.temperature),
//         )
//         .order("desc")
//         .take(limit);
//     } else {
//       leadScores = await ctx.db
//         .query("leadScores")
//         .withIndex("byHotScore")
//         .order("desc")
//         .take(limit);
//     }

//     let emailLogs: any[] = [];
//     if (args.campaignId) {
//       emailLogs = await ctx.db
//         .query("emailLogs")
//         .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
//         .collect();
//     }

//     const leadsWithScores = await Promise.all(
//       leadScores.map(async (score) => {
//         if (args.campaignId) {
//           const hasEmailInCampaign = emailLogs.some(
//             (log) => log.leadId === score.leadId,
//           );
//           if (!hasEmailInCampaign) return null;
//         }

//         const lead = await ctx.db.get(score.leadId);
//         if (!lead) return null;

//         let campaignMetrics = null;
//         let latestEmailSubject = null;
//         let campaignName = null;

//         if (args.campaignId) {
//           const campaignLogs = emailLogs.filter(
//             (log) => log.leadId === score.leadId,
//           );
//           campaignMetrics = {
//             emailsSent: campaignLogs.length,
//             emailsDelivered: campaignLogs.filter((log) => log.deliveredAt)
//               .length,
//             emailsOpened: campaignLogs.filter((log) => log.openedAt).length,
//             emailsClicked: campaignLogs.filter((log) => log.clickedAt).length,
//           };

//           const latestLog = campaignLogs.sort(
//             (a, b) => b.createdAt - a.createdAt,
//           )[0];
//           latestEmailSubject = latestLog?.subject;

//           const campaign = await ctx.db.get(args.campaignId);
//           campaignName = campaign?.name;
//         } else {
//           const latestEmailLog = await ctx.db
//             .query("emailLogs")
//             .withIndex("byLead", (q) => q.eq("leadId", score.leadId))
//             .order("desc")
//             .first();

//           latestEmailSubject = latestEmailLog?.subject;

//           if (latestEmailLog?.campaignId) {
//             const campaign = await ctx.db.get(latestEmailLog.campaignId);
//             campaignName = campaign?.name;
//           }
//         }

//         return {
//           ...lead,
//           score: score.hotScore,
//           temperature: score.temperature,
//           lastEngagementAt: score.lastEngagementAt,
//           lastEngagementType: score.lastEngagementType,
//           latestEmailSubject,
//           campaignName,
//           campaignMetrics,
//           metrics: {
//             totalEmailsSent: score.totalEmailsSent,
//             totalEmailsDelivered: score.totalEmailsDelivered,
//             totalEmailsOpened: score.totalEmailsOpened,
//             totalEmailsClicked: score.totalEmailsClicked,
//             openRate: score.openRate,
//             clickRate: score.clickRate,
//             engagementTrend: score.engagementTrend,
//           },
//         };
//       }),
//     );

//     return leadsWithScores.filter((lead) => lead !== null);
//   },
// });
