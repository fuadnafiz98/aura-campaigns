import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAudience = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const now = Date.now();
    return await ctx.db.insert("audiences", {
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    });
  },
});

export const updateAudience = mutation({
  args: {
    id: v.id("audiences"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.id);
    if (!audience || audience.createdBy !== userId) {
      throw new Error("Audience not found or unauthorized");
    }

    return await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      updatedAt: Date.now(),
    });
  },
});

export const deleteAudience = mutation({
  args: {
    id: v.id("audiences"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.id);
    if (!audience || audience.createdBy !== userId) {
      throw new Error("Audience not found or unauthorized");
    }

    // Delete all audience leads relationships
    const audienceLeads = await ctx.db
      .query("audienceLeads")
      .withIndex("byAudience", (q) => q.eq("audienceId", args.id))
      .collect();

    for (const audienceLead of audienceLeads) {
      await ctx.db.delete(audienceLead._id);
    }

    // Delete the audience
    return await ctx.db.delete(args.id);
  },
});

export const cloneAudience = mutation({
  args: {
    id: v.id("audiences"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const originalAudience = await ctx.db.get(args.id);
    if (!originalAudience || originalAudience.createdBy !== userId) {
      throw new Error("Audience not found or unauthorized");
    }

    const now = Date.now();
    const newAudienceId = await ctx.db.insert("audiences", {
      name: args.name,
      description: originalAudience.description,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    });

    // Clone all audience leads
    const originalAudienceLeads = await ctx.db
      .query("audienceLeads")
      .withIndex("byAudience", (q) => q.eq("audienceId", args.id))
      .collect();

    for (const audienceLead of originalAudienceLeads) {
      await ctx.db.insert("audienceLeads", {
        audienceId: newAudienceId,
        leadId: audienceLead.leadId,
        addedAt: now,
        addedBy: userId,
      });
    }

    return newAudienceId;
  },
});

export const getAudiences = query({
  args: {
    sortBy: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const query = ctx.db
      .query("audiences")
      .withIndex("byUser", (q) => q.eq("createdBy", userId))
      .order("desc");

    let results = await query.collect();

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      results = results.filter(
        (audience) =>
          audience.name.toLowerCase().includes(searchLower) ||
          (audience.description &&
            audience.description.toLowerCase().includes(searchLower)),
      );
    }

    if (args.sortBy) {
      results.sort((a, b) => {
        switch (args.sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "created":
            return b.createdAt - a.createdAt;
          default:
            return 0;
        }
      });
    }

    // Get lead counts for each audience
    const audiencesWithCounts = await Promise.all(
      results.map(async (audience) => {
        const leadsCount = await ctx.db
          .query("audienceLeads")
          .withIndex("byAudience", (q) => q.eq("audienceId", audience._id))
          .collect();

        return {
          ...audience,
          leadsCount: leadsCount.length,
        };
      }),
    );

    return audiencesWithCounts.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getAllAudiences = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    let results = await ctx.db
      .query("audiences")
      .withIndex("byUser", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      results = results.filter((audience) =>
        audience.name.toLowerCase().includes(searchLower),
      );
    }

    return results.map((audience) => ({
      _id: audience._id,
      name: audience.name,
      description: audience.description,
    }));
  },
});

export const getAudience = query({
  args: {
    id: v.id("audiences"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.id);
    if (!audience || audience.createdBy !== userId) {
      return null;
    }

    return audience;
  },
});

export const getAudiencesCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audiences = await ctx.db
      .query("audiences")
      .withIndex("byUser", (q) => q.eq("createdBy", userId))
      .collect();

    return audiences.length;
  },
});

export const addLeadToAudience = mutation({
  args: {
    audienceId: v.id("audiences"),
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.audienceId);
    if (!audience || audience.createdBy !== userId) {
      throw new Error("Audience not found or unauthorized");
    }

    const existingRelation = await ctx.db
      .query("audienceLeads")
      .withIndex("byAudienceLead", (q) =>
        q.eq("audienceId", args.audienceId).eq("leadId", args.leadId),
      )
      .first();

    if (existingRelation) {
      throw new Error("Lead is already in this audience");
    }

    return await ctx.db.insert("audienceLeads", {
      audienceId: args.audienceId,
      leadId: args.leadId,
      addedAt: Date.now(),
      addedBy: userId,
    });
  },
});

export const removeLeadFromAudience = mutation({
  args: {
    audienceId: v.id("audiences"),
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.audienceId);
    if (!audience || audience.createdBy !== userId) {
      throw new Error("Audience not found or unauthorized");
    }

    const relation = await ctx.db
      .query("audienceLeads")
      .withIndex("byAudienceLead", (q) =>
        q.eq("audienceId", args.audienceId).eq("leadId", args.leadId),
      )
      .first();

    if (!relation) {
      throw new Error("Lead not found in audience");
    }

    return await ctx.db.delete(relation._id);
  },
});

export const getAudienceLeads = query({
  args: {
    audienceId: v.id("audiences"),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.audienceId);
    if (!audience || audience.createdBy !== userId) {
      throw new Error("Audience not found or unauthorized");
    }

    const audienceLeads = await ctx.db
      .query("audienceLeads")
      .withIndex("byAudience", (q) => q.eq("audienceId", args.audienceId))
      .collect();

    const leads = await Promise.all(
      audienceLeads.map(async (audienceLead) => {
        const lead = await ctx.db.get(audienceLead.leadId);
        return lead ? { ...lead, addedAt: audienceLead.addedAt } : null;
      }),
    );

    const results = leads.filter((lead) => lead !== null);

    if (args.sortBy) {
      results.sort((a, b) => {
        switch (args.sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "email":
            return a.email.localeCompare(b.email);
          case "company":
            return a.company.localeCompare(b.company);
          case "added":
            return b.addedAt - a.addedAt;
          default:
            return 0;
        }
      });
    }

    return results;
  },
});

export const getAudienceLeadsCount = query({
  args: {
    audienceId: v.id("audiences"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.audienceId);
    if (!audience || audience.createdBy !== userId) {
      return 0;
    }

    const audienceLeads = await ctx.db
      .query("audienceLeads")
      .withIndex("byAudience", (q) => q.eq("audienceId", args.audienceId))
      .collect();

    return audienceLeads.length;
  },
});

export const addLeadsToAudience = internalMutation({
  args: {
    audienceId: v.id("audiences"),
    leadIds: v.array(v.id("leads")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const audience = await ctx.db.get(args.audienceId);
    if (!audience || audience.createdBy !== args.userId) {
      throw new Error("Audience not found or unauthorized");
    }

    const now = Date.now();
    for (const leadId of args.leadIds) {
      // Check if relationship already exists
      const existingRelation = await ctx.db
        .query("audienceLeads")
        .withIndex("byAudienceLead", (q) =>
          q.eq("audienceId", args.audienceId).eq("leadId", leadId),
        )
        .first();

      if (!existingRelation) {
        await ctx.db.insert("audienceLeads", {
          audienceId: args.audienceId,
          leadId,
          addedAt: now,
          addedBy: args.userId,
        });
      }
    }
  },
});

export const addLeadsToAudiencePublic = mutation({
  args: {
    audienceId: v.id("audiences"),
    leadIds: v.array(v.id("leads")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const audience = await ctx.db.get(args.audienceId);
    if (!audience || audience.createdBy !== userId) {
      throw new Error("Audience not found or unauthorized");
    }

    const now = Date.now();
    let addedCount = 0;

    for (const leadId of args.leadIds) {
      // Check if relationship already exists
      const existingRelation = await ctx.db
        .query("audienceLeads")
        .withIndex("byAudienceLead", (q) =>
          q.eq("audienceId", args.audienceId).eq("leadId", leadId),
        )
        .first();

      if (!existingRelation) {
        await ctx.db.insert("audienceLeads", {
          audienceId: args.audienceId,
          leadId,
          addedAt: now,
          addedBy: userId,
        });
        addedCount++;
      }
    }

    return { addedCount, totalRequested: args.leadIds.length };
  },
});
