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
});
