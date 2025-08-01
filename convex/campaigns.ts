import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query to get a paginated, filtered, and sorted list of campaigns
export const getCampaigns = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filterStatus: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    // Start with base query filtered by user
    let campaignsQuery = ctx.db
      .query("campaigns")
      .filter((q) => q.eq(q.field("createdBy"), userId));

    // Apply status filter
    if (args.filterStatus && args.filterStatus !== "all") {
      campaignsQuery = campaignsQuery.filter((q) =>
        q.eq(q.field("status"), args.filterStatus),
      );
    }

    // Apply search filter
    if (args.searchQuery && args.searchQuery.trim() !== "") {
      const searchLower = args.searchQuery.toLowerCase();
      campaignsQuery = campaignsQuery.filter((q) =>
        q.or(
          q.gte(q.field("name"), searchLower),
          q.gte(q.field("targetAudience"), searchLower),
        ),
      );
    }

    const campaigns = await campaignsQuery.paginate(args.paginationOpts);
    return campaigns;
  },
});

// Query to get the total count of campaigns based on the current filters
export const getCampaignsCount = query({
  args: {
    filterStatus: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    // Start with base query filtered by user
    const queryBuilder = ctx.db
      .query("campaigns")
      .filter((q) => q.eq(q.field("createdBy"), userId));

    // Collect all campaigns for the user first
    const allCampaigns = await queryBuilder.collect();

    // Apply filters in memory
    let filteredCampaigns = allCampaigns;

    // Filter by status
    if (args.filterStatus && args.filterStatus !== "all") {
      filteredCampaigns = filteredCampaigns.filter(
        (c) => c.status === args.filterStatus,
      );
    }

    // Filter by search query
    if (args.searchQuery && args.searchQuery.trim() !== "") {
      const query = args.searchQuery.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.targetAudience.toLowerCase().includes(query),
      );
    }

    return filteredCampaigns.length;
  },
});

// Mutation to create a new campaign
export const createCampaign = mutation({
  args: {
    name: v.string(),
    targetAudience: v.string(),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User must be authenticated to create a campaign");
    }

    // Check if campaign name already exists for this user
    const existingCampaign = await ctx.db
      .query("campaigns")
      .filter((q) =>
        q.and(
          q.eq(q.field("createdBy"), userId),
          q.eq(q.field("name"), args.name),
        ),
      )
      .first();

    if (existingCampaign) {
      throw new Error("A campaign with this name already exists");
    }

    // Create the campaign
    const campaignId = await ctx.db.insert("campaigns", {
      name: args.name,
      targetAudience: args.targetAudience,
      status: args.status || "draft",
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // You can add more fields here like:
      // emailsSent: 0,
      // emailsOpened: 0,
      // clickThroughRate: 0,
    });

    return campaignId;
  },
});

// Optional: Add a mutation to update campaign
export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    name: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User must be authenticated to update a campaign");
    }

    // Get the campaign
    const campaign = await ctx.db.get(args.id);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.createdBy !== userId) {
      throw new Error("You don't have permission to update this campaign");
    }

    // If updating name, check for duplicates
    if (args.name && args.name !== campaign.name) {
      const existingCampaign = await ctx.db
        .query("campaigns")
        .filter((q) =>
          q.and(
            q.eq(q.field("createdBy"), userId),
            q.eq(q.field("name"), args.name),
          ),
        )
        .first();

      if (existingCampaign) {
        throw new Error("A campaign with this name already exists");
      }
    }

    // Update the campaign
    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.targetAudience && { targetAudience: args.targetAudience }),
      ...(args.status && { status: args.status }),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Query to get a single campaign
export const getCampaign = query({
  args: {
    id: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User must be authenticated to view a campaign");
    }

    const campaign = await ctx.db.get(args.id);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.createdBy !== userId) {
      throw new Error("You don't have permission to view this campaign");
    }

    return campaign;
  },
});

// Mutation to publish a campaign
export const updateCampaignStatus = mutation({
  args: {
    id: v.id("campaigns"),
    action: v.string(),
    audienceIds: v.optional(v.array(v.id("audiences"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to update campaign");
    }

    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.createdBy !== userId) {
      throw new Error("You don't have permission to update this campaign");
    }

    switch (args.action) {
      case "publish":
        // Validate that audiences are selected
        if (!args.audienceIds || args.audienceIds.length === 0) {
          throw new Error(
            "Please select at least one audience before publishing",
          );
        }
        await ctx.db.patch(args.id, {
          status: "active",
          audienceIds: args.audienceIds,
          updatedAt: Date.now(),
        });
        break;

      case "pause":
        if (campaign.status !== "active") {
          throw new Error("Can only pause active campaigns");
        }
        await ctx.db.patch(args.id, {
          status: "paused",
          updatedAt: Date.now(),
        });
        break;

      case "resume":
        if (campaign.status !== "paused") {
          throw new Error("Can only resume paused campaigns");
        }
        await ctx.db.patch(args.id, {
          status: "active",
          updatedAt: Date.now(),
        });
        break;

      default:
        throw new Error(`Invalid action: ${args.action}`);
    }

    return args.id;
  },
});

export const updateCampaignAudiences = mutation({
  args: {
    id: v.id("campaigns"),
    audienceIds: v.array(v.id("audiences")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to update campaign");
    }

    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.createdBy !== userId) {
      throw new Error("You don't have permission to update this campaign");
    }

    // Only allow updating audiences if campaign is still in draft
    if (campaign.status !== "draft") {
      throw new Error("Can only update audiences for draft campaigns");
    }

    await ctx.db.patch(args.id, {
      audienceIds: args.audienceIds,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Optional: Add a mutation to delete campaign
export const deleteCampaign = mutation({
  args: {
    id: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User must be authenticated to delete a campaign");
    }

    const campaign = await ctx.db.get(args.id);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.createdBy !== userId) {
      throw new Error("You don't have permission to delete this campaign");
    }

    await ctx.db.delete(args.id);
  },
});
