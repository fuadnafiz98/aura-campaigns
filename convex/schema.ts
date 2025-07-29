import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),

  files: defineTable({
    body: v.string(),
    author: v.string(),
    format: v.string(),
  }),

  CSVWFTasks: defineTable({
    storageId: v.id("_storage"),
    status: v.string(),
  }),

  leads: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.string(),
    category: v.string(),
    imported_by: v.id("users"),
    imported_at: v.number(),
  }).index("byEmail", ["email"]),

  campaigns: defineTable({
    name: v.string(),
    targetAudience: v.string(),
    status: v.string(),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    schedulingStatus: v.optional(v.string()),
  }).index("byStatus", ["status"]),

  emails: defineTable({
    subject: v.string(),
    body: v.string(),
    delay: v.number(),
    delayUnit: v.string(),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
    campaignId: v.id("campaigns"),
    ordering: v.number(),
  })
    .index("byCampaign", ["campaignId"])
    .index("ordering", ["ordering"]),
});
