import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get campaign emails with their current status
export const getCampaignEmailsWithStatus = query({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db
      .query("emails")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .order("asc")
      .collect();
  },
});
