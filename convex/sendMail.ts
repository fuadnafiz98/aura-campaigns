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

export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, args) => {
    console.log("Email event received:", args.id, args.event);

    // Find the email log
    const emailLog = await ctx.db
      .query("emailLogs")
      .withIndex("byResendId", (q) => q.eq("resendId", args.id))
      .first();

    if (!emailLog) {
      console.warn(`Email log not found for resendId: ${args.id}`);
      return;
    }

    // Don't update if email is already in a final failure state
    const finalStates = ["bounced", "complained", "failed"];
    if (finalStates.includes(emailLog.status.toLowerCase())) {
      console.log(
        `Email ${args.id} is already in final state: ${emailLog.status}`,
      );
      return;
    }

    // Simple status mapping
    let status = args.event.type;
    if (args.event.type.startsWith("email.")) {
      status = args.event.type.replace("email.", "");
    }

    const updateData: any = {
      status: status,
      event: args.event.type,
      updatedAt: Date.now(),
    };

    // Add error message for failures
    if (status === "failed" || status === "bounced") {
      updateData.errorMessage = `Email ${status}`;
    }

    await ctx.db.patch(emailLog._id, updateData);
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

    // Get the email content from the database
    const email = await ctx.db.get(args.emailId);
    if (!email) {
      throw new Error(`Email with ID ${args.emailId} not found`);
    }

    // Get the lead for personalization
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error(`Lead with ID ${args.leadId} not found`);
    }

    // Send email via Resend
    const resendId = await resend.sendEmail(ctx, {
      from: "Aura Campaigns <campaigns@fuadnafiz98.com>",
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
      status: "queued",
    });

    const pendingMails = await ctx.db
      .query("emailLogs")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "scheduled"),
          q.eq(q.field("status"), "pending"),
        ),
      )
      .collect();

    if (pendingMails.length === 0) {
      // we have send all the mails,
      await ctx.db.patch(args.emailId, {
        status: "sent",
      });
    }

    const campaignMails = await ctx.db
      .query("emails")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const sendCampaignMails = campaignMails.filter((c) => c.status === "sent");

    if (campaignMails.length === sendCampaignMails.length) {
      await ctx.db.patch(args.campaignId, {
        status: "completed",
      });
    }
    return resendId;
  },
});
