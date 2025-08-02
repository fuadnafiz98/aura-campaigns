import { v } from "convex/values";
import { internalMutation, internalAction, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Create a scheduled job for sending an email
export const createScheduledEmail = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    emailId: v.id("emails"),
    leadId: v.id("leads"),
    scheduledAt: v.number(),
    jobId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledJobs", {
      campaignId: args.campaignId,
      emailId: args.emailId,
      leadId: args.leadId,
      scheduledAt: args.scheduledAt,
      status: "scheduled",
      jobId: args.jobId,
      createdAt: Date.now(),
      createdBy: args.userId,
    });
  },
});

// Update scheduled job status
export const updateScheduledJobStatus = internalMutation({
  args: {
    jobId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const scheduledJob = await ctx.db
      .query("scheduledJobs")
      .withIndex("byJobId", (q) => q.eq("jobId", args.jobId))
      .first();

    if (!scheduledJob) {
      console.warn(`Scheduled job not found for jobId: ${args.jobId}`);
      return null;
    }

    return await ctx.db.patch(scheduledJob._id, {
      status: args.status,
    });
  },
});

// Cancel all scheduled jobs for a campaign
export const cancelCampaignScheduledJobs = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const scheduledJobs = await ctx.db
      .query("scheduledJobs")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();

    const cancelledJobs = [];
    for (const job of scheduledJobs) {
      await ctx.db.patch(job._id, {
        status: "cancelled",
      });
      cancelledJobs.push(job.jobId);
    }

    return cancelledJobs;
  },
});

// Get scheduled jobs for a campaign
export const getCampaignScheduledJobs = query({
  args: {
    campaignId: v.id("campaigns"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    let query = ctx.db
      .query("scheduledJobs")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const jobs = await query.collect();

    // Get additional details for each job
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const email = await ctx.db.get(job.emailId);
        const lead = await ctx.db.get(job.leadId);

        return {
          ...job,
          email: email
            ? {
                subject: email.subject,
                delay: email.delay,
                delayUnit: email.delayUnit,
              }
            : null,
          lead: lead ? { name: lead.name, email: lead.email } : null,
        };
      }),
    );

    return jobsWithDetails;
  },
});

// Function to send a scheduled email
export const sendScheduledEmail = internalAction({
  args: {
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Executing scheduled email job: ${args.jobId}`);

    try {
      // Get the scheduled job details
      const scheduledJob = await ctx.runMutation(
        internal.scheduledEmails.getScheduledJobByJobIdInternal,
        {
          jobId: args.jobId,
        },
      );

      if (!scheduledJob) {
        console.error(`Scheduled job not found: ${args.jobId}`);
        return;
      }

      if (scheduledJob.status !== "scheduled") {
        console.log(
          `Job ${args.jobId} is not in scheduled status: ${scheduledJob.status}`,
        );
        return;
      }

      // Get email and lead details
      const email = await ctx.runMutation(
        internal.scheduledEmails.getEmailDetailsInternal,
        {
          emailId: scheduledJob.emailId,
        },
      );

      const lead = await ctx.runMutation(
        internal.scheduledEmails.getLeadDetailsInternal,
        {
          leadId: scheduledJob.leadId,
        },
      );

      if (!email || !lead) {
        console.error(`Email or lead not found for job ${args.jobId}`);
        await ctx.runMutation(
          internal.scheduledEmails.updateScheduledJobStatus,
          {
            jobId: args.jobId,
            status: "failed",
          },
        );
        return;
      }

      // Send the email
      const emailId = await ctx.runMutation(
        internal.sendMail._sendEmailFromCampaign,
        {
          to: lead.email,
          emailId: scheduledJob.emailId,
          campaignId: scheduledJob.campaignId,
          leadId: scheduledJob.leadId,
          scheduledJobId: args.jobId,
          userId: scheduledJob.createdBy,
        },
      );

      console.log(
        `Email sent successfully for job ${args.jobId}, email ID: ${emailId}`,
      );

      // Update job status to sent
      await ctx.runMutation(internal.scheduledEmails.updateScheduledJobStatus, {
        jobId: args.jobId,
        status: "sent",
      });
    } catch (error) {
      console.error(`Error sending scheduled email ${args.jobId}:`, error);

      // Update job status to failed
      await ctx.runMutation(internal.scheduledEmails.updateScheduledJobStatus, {
        jobId: args.jobId,
        status: "failed",
      });
    }
  },
});

// Internal mutation helpers for actions
export const getScheduledJobByJobIdInternal = internalMutation({
  args: {
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduledJobs")
      .withIndex("byJobId", (q) => q.eq("jobId", args.jobId))
      .first();
  },
});

export const getEmailDetailsInternal = internalMutation({
  args: {
    emailId: v.id("emails"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.emailId);
  },
});

export const getLeadDetailsInternal = internalMutation({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.leadId);
  },
});
