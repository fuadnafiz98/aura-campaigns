import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";
import workflow from "@convex-dev/workflow/convex.config";

const app = defineApp();
app.use(workflow);
app.use(resend);

export default app;
