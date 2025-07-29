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

export const getImgUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const file = await ctx.storage.getUrl(args.storageId);
    if (!file) throw new Error("File not found");
    return file;
  },
});
