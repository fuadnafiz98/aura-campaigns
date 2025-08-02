import { v } from "convex/values";
import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Calculate delay in milliseconds
function calculateDelayMs(delay: number, delayUnit: string): number {
  switch (delayUnit) {
    case "minutes":
      return delay * 60 * 1000;
    case "hours":
      return delay * 60 * 60 * 1000;
    case "days":
      return delay * 24 * 60 * 60 * 1000;
    default:
      return 0; // immediate
  }
}

// Schedule all emails for a campaign when published
export const scheduleCampaignEmails = internalAction({
  args: {
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`Scheduling emails for campaign: ${args.campaignId}`);

    try {
      // Get campaign details
      const campaign = await ctx.runMutation(
        internal.campaignScheduler.getCampaignDetails,
        {
          campaignId: args.campaignId,
        },
      );

      if (
        !campaign ||
        !campaign.audienceIds ||
        campaign.audienceIds.length === 0
      ) {
        throw new Error("Campaign not found or no audiences selected");
      }

      // Get emails for the campaign, sorted by ordering
      const emails = await ctx.runMutation(
        internal.campaignScheduler.getCampaignEmails,
        {
          campaignId: args.campaignId,
        },
      );

      if (!emails || emails.length === 0) {
        throw new Error("No emails found for campaign");
      }

      // Get first 3 leads from each audience (as requested)
      const allLeads = [];
      for (const audienceId of campaign.audienceIds) {
        const audienceLeads = await ctx.runMutation(
          internal.campaignScheduler.getAudienceLeads,
          {
            audienceId,
            limit: 3,
          },
        );
        allLeads.push(...audienceLeads);
      }

      if (allLeads.length === 0) {
        throw new Error("No leads found in selected audiences");
      }

      console.log(`Found ${allLeads.length} leads to schedule emails for`);

      let totalScheduledJobs = 0;
      const now = Date.now();

      // Schedule emails for each lead
      for (const lead of allLeads) {
        let baseTime = now;

        for (const email of emails) {
          // Calculate when this email should be sent
          const delayMs = calculateDelayMs(email.delay, email.delayUnit);
          const scheduledAt = baseTime + delayMs;

          // Generate a simple unique job ID
          const simpleJobId = crypto.randomUUID();

          // Schedule the email
          await ctx.scheduler.runAt(
            scheduledAt,
            internal.scheduledEmails.sendScheduledEmail,
            {
              jobId: simpleJobId,
            },
          );

          // Create scheduled job record
          await ctx.runMutation(internal.scheduledEmails.createScheduledEmail, {
            campaignId: args.campaignId,
            emailId: email._id,
            leadId: lead._id,
            scheduledAt,
            jobId: simpleJobId,
            userId: args.userId,
          });

          // Update base time for the next email in the sequence
          baseTime = scheduledAt;
          totalScheduledJobs++;
        }
      }

      console.log(`Successfully scheduled ${totalScheduledJobs} email jobs`);

      // Update campaign status to active and mark as scheduled
      await ctx.runMutation(
        internal.campaignScheduler.updateCampaignSchedulingStatus,
        {
          campaignId: args.campaignId,
          status: "active",
          schedulingStatus: "scheduled",
        },
      );

      return { success: true, scheduledJobs: totalScheduledJobs };
    } catch (error) {
      console.error(`Error scheduling campaign ${args.campaignId}:`, error);

      // Update campaign with error status
      await ctx.runMutation(
        internal.campaignScheduler.updateCampaignSchedulingStatus,
        {
          campaignId: args.campaignId,
          status: "draft",
          schedulingStatus: "failed",
        },
      );

      throw error;
    }
  },
});

// Cancel all scheduled emails for a campaign when paused
export const cancelCampaignEmails = internalAction({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    console.log(`Cancelling scheduled emails for campaign: ${args.campaignId}`);

    try {
      // Get all scheduled jobs for the campaign
      const scheduledJobs = await ctx.runMutation(
        internal.scheduledEmails.cancelCampaignScheduledJobs,
        {
          campaignId: args.campaignId,
        },
      );

      // Cancel each job in the scheduler
      let cancelledCount = 0;
      for (const jobId of scheduledJobs) {
        try {
          await ctx.scheduler.cancel(jobId as any);
          cancelledCount++;
        } catch (error) {
          console.warn(`Failed to cancel job ${jobId}:`, error);
        }
      }

      console.log(`Cancelled ${cancelledCount} scheduled jobs`);

      // Update campaign scheduling status
      await ctx.runMutation(
        internal.campaignScheduler.updateCampaignSchedulingStatus,
        {
          campaignId: args.campaignId,
          status: "paused",
          schedulingStatus: "cancelled",
        },
      );

      return { success: true, cancelledJobs: cancelledCount };
    } catch (error) {
      console.error(`Error cancelling campaign ${args.campaignId}:`, error);
      throw error;
    }
  },
});

// Resume a paused campaign by rescheduling remaining emails
export const resumeCampaignEmails = internalAction({
  args: {
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`Resuming campaign: ${args.campaignId}`);

    try {
      // Get all cancelled jobs for this campaign
      const cancelledJobs = await ctx.runMutation(
        internal.campaignScheduler.getCancelledScheduledJobs,
        {
          campaignId: args.campaignId,
        },
      );

      if (cancelledJobs.length === 0) {
        console.log("No cancelled jobs to resume");
        return { success: true, rescheduledJobs: 0 };
      }

      let rescheduledCount = 0;
      const now = Date.now();

      // Reschedule each cancelled job
      for (const job of cancelledJobs) {
        // Calculate new schedule time (original delay from now)
        const email = await ctx.runMutation(
          internal.scheduledEmails.getEmailDetailsInternal,
          {
            emailId: job.emailId,
          },
        );

        if (!email) continue;

        const delayMs = calculateDelayMs(email.delay, email.delayUnit);
        const newScheduledAt = now + delayMs;

        // Create new job ID
        const newJobId = crypto.randomUUID();

        // Schedule the email
        const jobId = await ctx.scheduler.runAt(
          newScheduledAt,
          internal.scheduledEmails.sendScheduledEmail,
          {
            jobId: newJobId,
          },
        );

        // Update the scheduled job record
        await ctx.runMutation(internal.campaignScheduler.updateScheduledJob, {
          scheduledJobId: job._id,
          newJobId: jobId,
          newScheduledAt,
          status: "scheduled",
        });

        rescheduledCount++;
      }

      console.log(`Rescheduled ${rescheduledCount} jobs`);

      // Update campaign status
      await ctx.runMutation(
        internal.campaignScheduler.updateCampaignSchedulingStatus,
        {
          campaignId: args.campaignId,
          status: "active",
          schedulingStatus: "scheduled",
        },
      );

      return { success: true, rescheduledJobs: rescheduledCount };
    } catch (error) {
      console.error(`Error resuming campaign ${args.campaignId}:`, error);
      throw error;
    }
  },
});

// Helper internal mutations
export const getCampaignDetails = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.campaignId);
  },
});

export const getCampaignEmails = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .order("asc")
      .collect();
  },
});

export const getAudienceLeads = internalMutation({
  args: {
    audienceId: v.id("audiences"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Get audience-lead relationships
    const audienceLeads = await ctx.db
      .query("audienceLeads")
      .withIndex("byAudience", (q) => q.eq("audienceId", args.audienceId))
      .take(args.limit);

    // Get actual lead data
    const leads = [];
    for (const audienceLead of audienceLeads) {
      const lead = await ctx.db.get(audienceLead.leadId);
      if (lead) {
        leads.push(lead);
      }
    }

    return leads;
  },
});

export const updateCampaignSchedulingStatus = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    status: v.optional(v.string()),
    schedulingStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.status) {
      updateData.status = args.status;
    }

    if (args.schedulingStatus) {
      updateData.schedulingStatus = args.schedulingStatus;
    }

    return await ctx.db.patch(args.campaignId, updateData);
  },
});

export const getCancelledScheduledJobs = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduledJobs")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("status"), "cancelled"))
      .collect();
  },
});

export const updateScheduledJob = internalMutation({
  args: {
    scheduledJobId: v.id("scheduledJobs"),
    newJobId: v.string(),
    newScheduledAt: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.scheduledJobId, {
      jobId: args.newJobId,
      scheduledAt: args.newScheduledAt,
      status: args.status,
    });
  },
});
