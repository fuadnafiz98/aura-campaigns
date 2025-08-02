import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new email log entry
export const createEmailLog = mutation({
  args: {
    to: v.string(),
    replyTo: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
    resendId: v.string(),
    status: v.string(),
    campaignId: v.optional(v.id("campaigns")),
    emailId: v.optional(v.id("emails")),
    leadId: v.optional(v.id("leads")),
    scheduledJobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("emailLogs", {
      to: args.to,
      replyTo: args.replyTo,
      subject: args.subject,
      body: args.body,
      resendId: args.resendId,
      status: args.status,
      createdAt: now,
      updatedAt: now,
      sentBy: userId,
      campaignId: args.campaignId,
      emailId: args.emailId,
      leadId: args.leadId,
      scheduledJobId: args.scheduledJobId,
    });
  },
});

// Update email log status and event
export const updateEmailLogStatus = mutation({
  args: {
    resendId: v.string(),
    status: v.string(),
    event: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the email log by resendId
    const emailLog = await ctx.db
      .query("emailLogs")
      .withIndex("byResendId", (q) => q.eq("resendId", args.resendId))
      .first();

    if (!emailLog) {
      console.warn(`Email log not found for resendId: ${args.resendId}`);
      return null;
    }

    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.event !== undefined) {
      updateData.event = args.event;
    }

    if (args.errorMessage !== undefined) {
      updateData.errorMessage = args.errorMessage;
    }

    return await ctx.db.patch(emailLog._id, updateData);
  },
});

// Get email log by resendId
export const getEmailLogByResendId = query({
  args: {
    resendId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailLogs")
      .withIndex("byResendId", (q) => q.eq("resendId", args.resendId))
      .first();
  },
});

// List all email logs for the current user
export const listEmailLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const query = ctx.db
      .query("emailLogs")
      .withIndex("byUser", (q) => q.eq("sentBy", userId))
      .order("desc");

    let results;
    if (args.limit) {
      results = await query.take(args.limit);
    } else {
      results = await query.collect();
    }

    // Sort by updatedAt in descending order (most recently updated first)
    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// List email logs with pagination
export const listEmailLogsWithPagination = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db
      .query("emailLogs")
      .withIndex("byUser", (q) => q.eq("sentBy", userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Get email logs by status
export const getEmailLogsByStatus = query({
  args: {
    status: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const query = ctx.db
      .query("emailLogs")
      .withIndex("byStatus", (q) => q.eq("status", args.status))
      .filter((q) => q.eq(q.field("sentBy"), userId))
      .order("desc");

    let results;
    if (args.limit) {
      results = await query.take(args.limit);
    } else {
      results = await query.collect();
    }

    // Sort by updatedAt in descending order (most recently updated first)
    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get email logs statistics
export const getEmailLogsStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const allLogs = await ctx.db
      .query("emailLogs")
      .withIndex("byUser", (q) => q.eq("sentBy", userId))
      .collect();

    const stats = {
      total: allLogs.length,
      sent: 0,
      delivered: 0,
      bounced: 0,
      failed: 0,
      pending: 0,
      opened: 0,
      clicked: 0,
      complained: 0,
    };

    allLogs.forEach((log) => {
      const status = log.status.toLowerCase();
      switch (status) {
        case "sent":
          stats.sent++;
          break;
        case "delivered":
          stats.delivered++;
          break;
        case "bounced":
          stats.bounced++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "opened":
          stats.delivered++;
          stats.opened++;
          break;
        case "clicked":
          stats.delivered++;
          stats.clicked++;
          break;
        case "complained":
          stats.complained++;
          break;
        case "waiting":
        case "queued":
          stats.pending++;
          break;
        default:
          // Handle any other statuses as pending for now
          console.log(`Unknown email status: ${log.status}`);
          stats.pending++;
          break;
      }
    });

    return stats;
  },
});

// Debug helper to get the latest email logs with their statuses
export const getRecentEmailLogsForDebug = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const recentLogs = await ctx.db
      .query("emailLogs")
      .withIndex("byUser", (q) => q.eq("sentBy", userId))
      .order("desc")
      .take(5);

    return recentLogs.map((log) => ({
      to: log.to,
      subject: log.subject,
      status: log.status,
      event: log.event,
      resendId: log.resendId,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }));
  },
});

// Get email logs for a specific campaign
export const getCampaignEmailLogs = query({
  args: {
    campaignId: v.id("campaigns"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const query = ctx.db
      .query("emailLogs")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("sentBy"), userId))
      .order("desc");

    let results;
    if (args.limit) {
      results = await query.take(args.limit);
    } else {
      results = await query.collect();
    }

    // Get additional details for each log
    const logsWithDetails = await Promise.all(
      results.map(async (log) => {
        let lead = null;
        let email = null;

        if (log.leadId) {
          lead = await ctx.db.get(log.leadId);
        }

        if (log.emailId) {
          email = await ctx.db.get(log.emailId);
        }

        return {
          ...log,
          lead: lead ? { name: lead.name, company: lead.company } : null,
          email: email
            ? {
                subject: email.subject,
                delay: email.delay,
                delayUnit: email.delayUnit,
              }
            : null,
        };
      }),
    );

    return logsWithDetails;
  },
});

// Get campaign email statistics
export const getCampaignEmailStats = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const allLogs = await ctx.db
      .query("emailLogs")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("sentBy"), userId))
      .collect();

    const stats = {
      total: allLogs.length,
      sent: 0,
      delivered: 0,
      bounced: 0,
      failed: 0,
      pending: 0,
      opened: 0,
      clicked: 0,
      complained: 0,
    };

    allLogs.forEach((log) => {
      const status = log.status.toLowerCase();
      switch (status) {
        case "sent":
          stats.sent++;
          break;
        case "delivered":
          stats.delivered++;
          break;
        case "bounced":
          stats.bounced++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "opened":
          stats.delivered++;
          stats.opened++;
          break;
        case "clicked":
          stats.delivered++;
          stats.clicked++;
          break;
        case "complained":
          stats.complained++;
          break;
        case "waiting":
        case "queued":
          stats.pending++;
          break;
        default:
          stats.pending++;
          break;
      }
    });

    return stats;
  },
});
