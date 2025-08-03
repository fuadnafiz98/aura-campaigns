import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { resend } from "./sendMail";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    console.log("HERE!", req);
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;
