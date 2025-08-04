import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { HARD_EMAIL_PER_CAMPAIGN } from "./constants";

export const internalEmailsList = internalQuery({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .withIndex("ordering")
      .order("asc")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .take(HARD_EMAIL_PER_CAMPAIGN);
  },
});

export const emailsList = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .withIndex("ordering")
      .order("asc")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .collect();
  },
});

export const getEmail = query({
  args: {
    id: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.id);
    if (!email) throw new Error("Email not found");
    return email;
  },
});

export const internalGetEmail = internalQuery({
  args: {
    id: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.id);
    if (!email) throw new Error("Email not found");
    return email;
  },
});

export const createEmail = mutation({
  args: {
    campaignId: v.id("campaigns"),
    subject: v.string(),
    body: v.string(),
    delay: v.number(),
    delayUnit: v.string(),
    ordering: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const email = {
      subject: args.subject,
      body: args.body,
      delay: args.delay,
      delayUnit: args.delayUnit,
      status: "draft", // Default status for new emails
      createdAt: Date.now(),
      createdBy: userId,
      campaignId: args.campaignId,
      ordering: args.ordering,
    };
    return await ctx.db.insert("emails", email);
  },
});

export const updateEmail = mutation({
  args: {
    id: v.id("emails"),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    delay: v.optional(v.number()),
    delayUnit: v.optional(v.string()),
    ordering: v.optional(v.number()),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const emailUpdate: any = {};
    if (args.subject !== undefined) emailUpdate.subject = args.subject;
    if (args.body !== undefined) emailUpdate.body = args.body;
    if (args.delay !== undefined) emailUpdate.delay = args.delay;
    if (args.delayUnit !== undefined) emailUpdate.delayUnit = args.delayUnit;
    if (args.ordering !== undefined) emailUpdate.ordering = args.ordering;

    return await ctx.db.patch(args.id, {
      ...emailUpdate,
      updatedAt: Date.now(),
    });
  },
});

export const deleteEmail = mutation({
  args: {
    id: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Check if the email exists
    const email = await ctx.db.get(args.id);
    if (!email) throw new Error("Email not found");

    // Ensure the email belongs to the user
    if (email.createdBy !== userId) {
      throw new Error("You do not have permission to delete this email");
    }

    return await ctx.db.delete(args.id);
  },
});
