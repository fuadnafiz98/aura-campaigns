// in convex/leads.ts
import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query to get a paginated, filtered, and sorted list of leads
export const getLeads = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const leadsQuery = ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("imported_by"), userId));

    const leads = await leadsQuery.paginate(args.paginationOpts);
    return leads;
  },
});

// Query to get the total count of leads based on the current filter
export const getLeadsCount = query({
  args: {
    filterCategory: v.optional(v.string()),
  },
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    const queryBuilder = ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("imported_by"), userId));

    const allLeadsInFilter = await queryBuilder.collect();
    return allLeadsInFilter.length;
  },
});

// Query to get a single lead by ID (internal use)
export const getLead = query({
  args: {
    id: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) throw new Error("Lead not found");
    return lead;
  },
});

export const internalGetLead = internalQuery({
  args: {
    id: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    if (!lead) throw new Error("Lead not found");
    return lead;
  },
});
