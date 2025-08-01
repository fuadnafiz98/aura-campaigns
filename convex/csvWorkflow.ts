import { v } from "convex/values";
import { workflow } from ".";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { WorkflowId } from "@convex-dev/workflow";
import { getAuthUserId } from "@convex-dev/auth/server";

export const CSVImportWF = workflow.define({
  args: {
    storageId: v.id("_storage"),
    userId: v.id("users"),
    audienceId: v.optional(v.id("audiences")),
  },
  handler: async (step, args): Promise<Id<"CSVWFTasks">> => {
    const WFTaskId = await step.runMutation(
      internal.csvWorkflow.createCSVImportWFTask,
      {
        storageId: args.storageId,
      },
    );

    await step.runMutation(internal.csvWorkflow.updateCSVImportWFTask, {
      storageId: args.storageId,
      status: "PROCESSING",
    });

    await step.runAction(internal.praseCSV.parseCSVData, {
      storageId: args.storageId,
      userId: args.userId,
      audienceId: args.audienceId,
    });

    await step.runMutation(internal.csvWorkflow.updateCSVImportWFTask, {
      storageId: args.storageId,
      status: "DONE",
    });

    return WFTaskId;
  },
});

export const createCSVImportWFTask = internalMutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("CSVWFTasks", {
      storageId: args.storageId,
      status: "CREATED",
    });
  },
});

export const updateCSVImportWFTask = internalMutation({
  args: {
    storageId: v.id("_storage"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const wfId = await ctx.db
      .query("CSVWFTasks")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first();

    if (!wfId) return;

    await ctx.db.patch(wfId._id, {
      status: args.status,
    });
  },
});

// Add the batch insert mutation
export const insertCSVBatch = internalMutation({
  args: {
    records: v.array(
      v.object({
        name: v.string(),
        email: v.string(),
        company: v.string(),
        category: v.string(),
      }),
    ),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log("pushing to db");
    const leadIds = [];

    for (const record of args.records) {
      const leadId = await ctx.db.insert("leads", {
        name: record.name,
        email: record.email,
        company: record.company,
        category: record.category,
        imported_by: args.userId,
        imported_at: Date.now(),
      });
      leadIds.push(leadId);
    }

    return leadIds;
  },
});

export const KSCSVImportWf = action({
  args: {
    storageId: v.id("_storage"),
    audienceId: v.optional(v.id("audiences")),
  },
  handler: async (ctx, args): Promise<WorkflowId> => {
    const userId = await getAuthUserId(ctx);

    const workflowId = await workflow.start(
      ctx,
      internal.csvWorkflow.CSVImportWF,
      {
        storageId: args.storageId,
        userId: userId!,
        audienceId: args.audienceId,
      },
    );
    return workflowId;
  },
});

export const CSVImportWfTask = query({
  args: {
    id: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("CSVWFTasks")
      .filter((q) => q.eq(q.field("storageId"), args.id))
      .first();
  },
});
