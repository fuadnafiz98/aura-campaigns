// in convex/leads.ts
import { v } from "convex/values";
import { query } from "./_generated/server";
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
    const queryBuilder = ctx.db.query("leads");

    const allLeadsInFilter = await queryBuilder.collect();
    return allLeadsInFilter.length;
  },
});
