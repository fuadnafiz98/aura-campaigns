import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
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
    audienceIds: v.optional(v.array(v.id("audiences"))),
    status: v.string(),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    schedulingStatus: v.optional(v.string()),
    scheduledJobIds: v.optional(v.array(v.string())), // Store Convex scheduler job IDs
  }).index("byStatus", ["status"]),

  emails: defineTable({
    subject: v.string(),
    body: v.string(),
    delay: v.number(),
    delayUnit: v.string(),
    status: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
    campaignId: v.id("campaigns"),
    ordering: v.number(),
  })
    .index("byCampaign", ["campaignId"])
    .index("ordering", ["ordering"]),

  emailLogs: defineTable({
    to: v.optional(v.string()),
    replyTo: v.optional(v.string()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    resendId: v.optional(v.string()), // Email ID from Resend service
    event: v.optional(v.string()), // Latest event type
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    sentBy: v.id("users"),
    // Campaign tracking fields
    status: v.string(), // waiting, queued, sent, delivered, bounced, failed, etc.
    campaignId: v.optional(v.id("campaigns")),
    emailId: v.optional(v.id("emails")),
    leadId: v.optional(v.id("leads")),
    scheduledJobId: v.optional(v.string()), // ID of scheduled job
  })
    .index("byResendId", ["resendId"])
    .index("byStatus", ["status"])
    .index("byUser", ["sentBy"])
    .index("byCreatedAt", ["createdAt"])
    .index("byCampaign", ["campaignId"])
    .index("byLead", ["leadId"])
    .index("byScheduledJob", ["scheduledJobId"]),

  audiences: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  }).index("byUser", ["createdBy"]),

  audienceLeads: defineTable({
    audienceId: v.id("audiences"),
    leadId: v.id("leads"),
    addedAt: v.number(),
    addedBy: v.id("users"),
  })
    .index("byAudience", ["audienceId"])
    .index("byLead", ["leadId"])
    .index("byAudienceLead", ["audienceId", "leadId"]),
});
