import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    return {
      userId: userId,
      user: user?.email ?? null,
    };
  },
});
