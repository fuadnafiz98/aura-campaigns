"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Papa from "papaparse";

type CSVRecord = {
  name: string;
  email: string;
  company: string;
  category: string;
};

export const parseCSVData = internalAction({
  args: {
    storageId: v.id("_storage"),
    userId: v.id("users"),
    audienceId: v.optional(v.id("audiences")),
  },
  handler: async (ctx, args) => {
    // Get the file from Convex storage
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      console.log("NO file found");
      throw new Error("File not found in storage");
    }

    console.log("start parsing");
    // Convert blob to text
    const text = await blob.text();

    // Parse CSV with PapaParse
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      console.warn("Parse warnings:", parseResult.errors);
    }

    // Validate records
    const validRecords = parseResult.data.filter((record: any) => {
      return record.name && record.email && record.company && record.category;
    }) as CSVRecord[];

    const invalidCount = parseResult.data.length - validRecords.length;
    if (invalidCount > 0) {
      console.warn(`Skipped ${invalidCount} invalid records`);
    }

    // Import data to database in batches
    const BATCH_SIZE = 100;
    const importedLeadIds = [];

    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
      const batch = validRecords.slice(i, i + BATCH_SIZE);

      const batchResult = await ctx.runMutation(
        internal.csvWorkflow.insertCSVBatch,
        {
          records: batch,
          userId: args.userId,
        },
      );

      if (args.audienceId && batchResult.leadIds.length > 0) {
        importedLeadIds.push(...batchResult.leadIds);
      }
    }

    // If audienceId is provided, add all imported leads to the audience
    if (args.audienceId && importedLeadIds.length > 0) {
      await ctx.runMutation(internal.audiences.addLeadsToAudience, {
        audienceId: args.audienceId,
        leadIds: importedLeadIds,
        userId: args.userId,
      });
    }

    return {
      totalRecords: parseResult.data.length,
      validRecords: validRecords.length,
      skippedRecords: invalidCount,
      errors: parseResult.errors,
      success: true,
    };
  },
});
