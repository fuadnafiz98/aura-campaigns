import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendFile = mutation({
  args: { storageId: v.id("_storage"), author: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.insert("files", {
      body: args.storageId,
      author: args.author,
      format: "csv",
    });
  },
});
