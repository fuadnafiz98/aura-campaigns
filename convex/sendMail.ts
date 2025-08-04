import { components, internal } from "./_generated/api";
import { Resend, vEmailEvent, vEmailId } from "@convex-dev/resend";
import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
  onEmailEvent: internal.sendMail.handleEmailEvent,
});

export const sendTestEmailWithContent = action({
  args: {
    to: v.string(),
    id: v.id("emails"),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized: User must be logged in to send emails.");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const emailId = await ctx.runMutation(
      internal.sendMail._sendTestEmailWithContent,
      {
        to: args.to,
        id: args.id,
        replyTo: user.email,
        userId: userId,
      },
    );
    console.log("Test email sent to:", args.to, "with ID:", emailId);
  },
});

export const sendFollowUpEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    leadId: v.optional(v.id("leads")),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized: User must be logged in to send emails.");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const emailId = await ctx.runMutation(
      internal.sendMail._sendFollowUpEmail,
      {
        to: args.to,
        subject: args.subject,
        body: args.body,
        replyTo: user.email,
        userId: userId,
        leadId: args.leadId,
      },
    );
    console.log("Follow-up email sent to:", args.to, "with ID:", emailId);
  },
});

export const _sendTestEmailWithContent = internalMutation({
  args: {
    to: v.string(),
    id: v.id("emails"),
    replyTo: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log("SENDING TEST EMAIL TO:", args.to);

    if (!args.to || !args.id) {
      throw new Error("Missing required fields: to, or id");
    }

    // get the email content from the database
    const email = await ctx.db.get(args.id);
    if (!email) {
      throw new Error(`Email with ID ${args.id} not found`);
    }

    // Send email via Resend
    const emailId = await resend.sendEmail(ctx, {
      from: "Me <dev@fuadnafiz98.com>",
      to: args.to,
      replyTo: args.replyTo ? [args.replyTo] : [],
      subject: email.subject,
      html: email.body,
      headers: [
        {
          name: "List-Unsubscribe",
          value: "https://fuadnafiz98.com/unsubscribe",
        },
      ],
    });

    // Create email log entry
    const now = Date.now();
    await ctx.db.insert("emailLogs", {
      to: args.to,
      replyTo: args.replyTo,
      subject: email.subject,
      body: email.body,
      resendId: emailId,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      sentBy: args.userId,
    });

    return emailId;
  },
});

export const _sendFollowUpEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    replyTo: v.optional(v.string()),
    userId: v.id("users"),
    leadId: v.optional(v.id("leads")),
  },
  handler: async (ctx, args) => {
    console.log("SENDING FOLLOW-UP EMAIL TO:", args.to);

    if (!args.to || !args.subject || !args.body) {
      throw new Error("Missing required fields: to, subject, or body");
    }

    // Send email via Resend
    const emailId = await resend.sendEmail(ctx, {
      from: "Aura Campaigns <inbox@fuadnafiz98.com>",
      to: args.to,
      replyTo: args.replyTo ? [args.replyTo] : [],
      subject: args.subject,
      html: args.body,
      headers: [
        {
          name: "List-Unsubscribe",
          value: "https://fuadnafiz98.com/unsubscribe",
        },
      ],
    });

    // Create email log entry
    const now = Date.now();
    await ctx.db.insert("emailLogs", {
      to: args.to,
      replyTo: args.replyTo,
      subject: args.subject,
      body: args.body,
      resendId: emailId,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      sentBy: args.userId,
      leadId: args.leadId,
    });

    return emailId;
  },
});

export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, args) => {
    const emailLog = await ctx.db
      .query("emailLogs")
      .withIndex("byResendId", (q) => q.eq("resendId", args.id))
      .first();

    console.log("EVENTS->", args.id, emailLog?.status, args.event.type);

    if (!emailLog) {
      console.warn(`Email log not found for resendId: ${args.id}`);
      return;
    }

    const finalStates = ["bounced", "complained", "failed"];
    if (finalStates.includes(emailLog.status.toLowerCase())) {
      console.log(
        `Email ${args.id} is already in final state: ${emailLog.status}`,
      );
      return;
    }

    let status = args.event.type;
    if (args.event.type.startsWith("email.")) {
      status = args.event.type.replace("email.", "");
    }

    console.log("SSSSS", status);

    const updateData: any = {
      status: status,
      event: args.event.type,
      updatedAt: Date.now(),
    };

    // Add engagement timestamps for scoring
    const timestamp = Date.now();
    if (status === "delivered") {
      updateData.deliveredAt = timestamp;
    } else if (status === "opened") {
      if (!emailLog.openedAt) updateData.openedAt = timestamp;
      updateData.lastOpenedAt = timestamp;
      updateData.openCount = (emailLog.openCount || 0) + 1;
    } else if (status === "clicked") {
      if (!emailLog.clickedAt) updateData.clickedAt = timestamp;
      updateData.lastClickedAt = timestamp;
      updateData.clickCount = (emailLog.clickCount || 0) + 1;
    }

    if (status === "failed" || status === "bounced") {
      updateData.errorMessage = `Email ${status}`;
    }

    await ctx.db.patch(emailLog._id, updateData);
    console.log("SSSSS", emailLog);

    // Trigger lead scoring update for engagement events
    if (
      ["delivered", "opened", "clicked"].includes(status) &&
      emailLog.leadId
    ) {
      console.log("will update the scoring");
      await ctx.scheduler.runAfter(
        0,
        internal.leadScoringWorkers.triggerLeadScoreUpdate,
        {
          leadId: emailLog.leadId,
        },
      );
    }

    console.log(
      `Updated email log for ${args.id}: ${args.event.type} -> ${status}`,
    );
  },
});

// Send email from a campaign (for scheduled emails)
export const _sendEmailFromCampaign = internalMutation({
  args: {
    to: v.string(),
    emailId: v.id("emails"),
    campaignId: v.id("campaigns"),
    leadId: v.id("leads"),
    userId: v.id("users"),
    emailLogId: v.id("emailLogs"),
  },
  handler: async (ctx, args) => {
    console.log("SENDING CAMPAIGN EMAIL TO:", args.to);

    const email = await ctx.db.get(args.emailId);
    if (!email) {
      throw new Error(`Email with ID ${args.emailId} not found`);
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error(`Lead with ID ${args.leadId} not found`);
    }

    const resendId = await resend.sendEmail(ctx, {
      from: "Aura Campaigns <inbox@fuadnafiz98.com>",
      to: args.to,
      replyTo: [],
      subject: email.subject,
      html: email.body,
      headers: [
        {
          name: "List-Unsubscribe",
          value: "https://fuadnafiz98.com/unsubscribe",
        },
      ],
    });

    const now = Date.now();
    await ctx.db.patch(args.emailLogId, {
      updatedAt: now,
      resendId: resendId,
      leadId: args.leadId,
      status: "queued",
    });

    return resendId;
  },
});
