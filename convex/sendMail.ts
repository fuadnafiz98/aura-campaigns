import { components, internal } from "./_generated/api";
import { Resend, vEmailEvent, vEmailId } from "@convex-dev/resend";
import { action, internalMutation } from "./_generated/server";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
  onEmailEvent: internal.sendMail.handleEmailEvent,
});

export const _sendTestEmail = internalMutation({
  handler: async (ctx) => {
    console.log("SENDING");
    await resend.sendEmail(ctx, {
      from: "Me <dev@fuadnafiz98.com>",
      to: "fuadnafiz98@gmail.com",
      // to: "delivered@resend.dev",
      replyTo: ["delivered@resend.dev"],
      subject: "Hi there",
      html: "Please visit my website <a href='https://fuadnafiz98.com'>fuadnafiz98.com</a>\n Thanks",
    });
  },
});

export const sendTestEmail = action({
  args: {},
  handler: async (ctx, args) => {
    const resp = await ctx.runMutation(internal.sendMail._sendTestEmail, {});
    console.log("After mail sent", resp);
  },
});

export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, args) => {
    console.log("Email event:", args.id, args.event);
  },
});
