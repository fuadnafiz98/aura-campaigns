import { v } from "convex/values";
import { workflow } from ".";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { WorkflowId } from "@convex-dev/workflow";

export const CSVImportWF = workflow.define({
  args: {
    storageId: v.id("_storage"),
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

    await step.runAction(internal.csvWorkflow.parseCSVData, {});

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

export const parseCSVData = internalAction({
  args: {},
  handler: async () => {
    await new Promise((resolve) => setInterval(resolve, 3000));
  },
});

export const KSCSVImportWf = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<WorkflowId> => {
    const workflowId = await workflow.start(
      ctx,
      internal.csvWorkflow.CSVImportWF,
      {
        storageId: args.storageId,
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
