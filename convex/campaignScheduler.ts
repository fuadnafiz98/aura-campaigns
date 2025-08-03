import { v } from "convex/values";
import {
  internalMutation,
  internalAction,
  internalQuery,
} from "./_generated/server";
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
export const scheduleCampaignEmails = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`Scheduling emails for campaign: ${args.campaignId}`);

    try {
      const campaign = await ctx.db.get(args.campaignId);
      if (
        !campaign ||
        !campaign.audienceIds ||
        campaign.audienceIds.length === 0
      ) {
        throw new Error("Campaign not found or no audiences selected");
      }

      const emails = await ctx.runQuery(internal.emails.internalEmailsList, {
        campaignId: args.campaignId,
      });
      if (!emails || emails.length === 0) {
        throw new Error("No emails found for campaign");
      }

      // Get leads from all audiences using query
      const allLeads = [];
      for (const audienceId of campaign.audienceIds) {
        const audienceLeads = await ctx.runQuery(
          internal.campaignScheduler.getAudienceLeads,
          {
            audienceId,
            limit: 4,
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
      const scheduledJobIds = [];

      // Mark all emails as "scheduled"
      for (const email of emails) {
        await ctx.db.patch(email._id, {
          status: "scheduled",
        });
      }

      // Schedule emails for each lead
      for (const lead of allLeads) {
        let baseTime = now;

        for (const email of emails) {
          // Calculate when this email should be sent
          const delayMs = calculateDelayMs(email.delay, email.delayUnit);
          const scheduledAt = baseTime + delayMs;

          const emailLogId = await ctx.db.insert("emailLogs", {
            campaignId: args.campaignId,
            to: lead.email,
            subject: email.subject,
            emailId: email._id,
            leadId: lead._id,
            status: "scheduled",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            sentBy: args.userId,
          });

          // Schedule the email and get the job ID
          const jobId = await ctx.scheduler.runAt(
            scheduledAt,
            internal.campaignScheduler.sendScheduledCampaignEmail,
            {
              campaignId: args.campaignId,
              email: email._id,
              emailLogId: emailLogId,
              leadId: lead._id,
              userId: args.userId,
            },
          );

          scheduledJobIds.push(jobId);

          // Update base time for the next email in the sequence
          baseTime = scheduledAt;
          totalScheduledJobs++;
        }
      }

      console.log(`Successfully scheduled ${totalScheduledJobs} email jobs`);

      // Update campaign status to active and store scheduled job IDs
      await ctx.runMutation(
        internal.campaignScheduler.updateCampaignSchedulingStatus,
        {
          campaignId: args.campaignId,
          status: "active",
          schedulingStatus: "scheduled",
          scheduledJobIds: scheduledJobIds,
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

// Function to send a scheduled campaign email
export const sendScheduledCampaignEmail = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
    email: v.id("emails"),
    emailLogId: v.id("emailLogs"),
    leadId: v.id("leads"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(
      `Executing scheduled email job for email: ${args.emailLogId}, lead: ${args.leadId}`,
    );

    try {
      // Get email and lead details directly

      const email = await ctx.db.get(args.email);
      const lead = await ctx.db.get(args.leadId);

      if (!email || !lead) {
        console.error(`Email or lead not found for job`);
        // Update email status to failed
        if (email) {
          await ctx.db.patch(email._id, {
            status: "failed",
          });
        }
        return;
      }

      await ctx.db.patch(args.emailLogId, {
        status: "queued",
      });

      await ctx.db.patch(args.email, {
        status: "running",
      });

      // Send the email
      const emailId = await ctx.runMutation(
        internal.sendMail._sendEmailFromCampaign,
        {
          to: lead.email,
          emailId: args.email,
          campaignId: args.campaignId,
          leadId: args.leadId,
          userId: args.userId,
          emailLogId: args.emailLogId,
        },
      );

      console.log(`Email sent successfully, email ID: ${emailId}`);

      // Update email status to sent
      await ctx.db.patch(args.emailLogId, {
        status: "sent",
      });

      const pendingMails = await ctx.db
        .query("emailLogs")
        .withIndex("byCampaignEmail", (q) =>
          q.eq("campaignId", args.campaignId).eq("emailId", email._id),
        )
        .filter((q) =>
          q.or(
            q.eq(q.field("status"), "scheduled"),
            q.eq(q.field("status"), "pending"),
          ),
        )
        .collect();

      console.log("We have pending Mails", pendingMails.length);
      if (pendingMails.length === 0) {
        // we have send all the mails,
        console.log("----------------- SEND ALL MAILS----------------");
        await ctx.db.patch(email._id, {
          status: "sent",
        });
      }

      const campaignMails = await ctx.db
        .query("emails")
        .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
        .collect();
      const sendCampaignMails = campaignMails.filter(
        (c) => c.status === "sent",
      );
      if (campaignMails.length === sendCampaignMails.length) {
        console.log("----------------- CAMPAIGN DONE ----------------");
        await ctx.db.patch(args.campaignId, {
          status: "completed",
        });
      }
    } catch (error) {
      console.error(`Error sending scheduled email:`, error);
      await ctx.db.patch(args.emailLogId, {
        status: "failed",
      });
    }
  },
});

export const updateEmailStatus = internalMutation({
  args: {
    emailId: v.id("emails"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.emailId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Create email log entry for scheduled emails
export const createEmailLogEntry = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    status: v.string(),
    campaignId: v.id("campaigns"),
    emailId: v.id("emails"),
    leadId: v.id("leads"),
    userId: v.id("users"),
    scheduledJobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("emailLogs", {
      to: args.to,
      subject: args.subject,
      body: args.body,
      resendId: args.scheduledJobId || `scheduled-${now}`, // Use a temp ID for scheduled emails
      status: args.status,
      createdAt: now,
      updatedAt: now,
      sentBy: args.userId,
      campaignId: args.campaignId,
      emailId: args.emailId,
      leadId: args.leadId,
      scheduledJobId: args.scheduledJobId,
    });
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
      // Get campaign to find scheduled job IDs
      const campaign = await ctx.runQuery(
        internal.campaignScheduler.getCampaignDetails,
        {
          campaignId: args.campaignId,
        },
      );

      if (!campaign?.scheduledJobIds) {
        console.log("No scheduled jobs to cancel");
        return { success: true, cancelledJobs: 0 };
      }

      // Cancel each job in the scheduler
      let cancelledCount = 0;
      for (const jobId of campaign.scheduledJobIds) {
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
          scheduledJobIds: [], // Clear the job IDs
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
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; rescheduledJobs: number }> => {
    console.log(`Resuming campaign: ${args.campaignId}`);

    try {
      // Simply re-run the scheduling logic
      const result = await ctx.runMutation(
        internal.campaignScheduler.scheduleCampaignEmails,
        {
          campaignId: args.campaignId,
          userId: args.userId,
        },
      );

      console.log(`Resumed campaign with ${result.scheduledJobs} jobs`);
      return { success: true, rescheduledJobs: result.scheduledJobs };
    } catch (error) {
      console.error(`Error resuming campaign ${args.campaignId}:`, error);
      throw error;
    }
  },
});

export const getCampaignDetails = internalQuery({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.campaignId);
  },
});

// Get leads from an audience - keep this as it handles the audience-lead relationship
export const getAudienceLeads = internalQuery({
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
    scheduledJobIds: v.optional(v.array(v.string())),
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

    if (args.scheduledJobIds !== undefined) {
      updateData.scheduledJobIds = args.scheduledJobIds;
    }

    return await ctx.db.patch(args.campaignId, updateData);
  },
});

// Query to get campaign scheduling status using Convex's _scheduled_functions
// export const getCampaignSchedulingStatus = internalQuery({
//   args: {
//     campaignId: v.id("campaigns"),
//   },
//   handler: async (ctx, args) => {
//     const campaign = await ctx.db.get(args.campaignId);
//     if (!campaign?.scheduledJobIds) {
//       return { scheduled: 0, completed: 0, failed: 0, cancelled: 0 };
//     }

//     const stats = { scheduled: 0, completed: 0, failed: 0, cancelled: 0 };

//     for (const jobId of campaign.scheduledJobIds) {
//       try {
//         // Query the _scheduled_functions system table
//         const scheduledFunction = await ctx.db.system
//           .query("_scheduled_functions")
//           .filter((q) => q.eq(q.field("_id"), jobId))
//           .first();

//         if (scheduledFunction) {
//           const state = scheduledFunction.state;
//           if (state.kind === "pending") {
//             stats.scheduled++;
//           } else if (state.kind === "success") {
//             stats.completed++;
//           } else if (state.kind === "failed") {
//             stats.failed++;
//           } else if (state.kind === "canceled") {
//             stats.cancelled++;
//           }
//         }
//       } catch (error) {
//         console.warn(`Failed to get status for job ${jobId}:`, error);
//       }
//     }

//     return stats;
//   },
// });
