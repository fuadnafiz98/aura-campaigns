"use node";

import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.RESEND_API_KEY,
  maxAge: 60 * 15, // 15 minutes to match the example

  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };

    // Generate 8-digit numeric code to match the example
    const alphabet = "0123456789";
    const length = 6;
    return generateRandomString(random, alphabet, length);
  },

  async sendVerificationRequest({ identifier: email, provider, token }) {
    console.log(`Sending OTP to ${email} with token: ${token}`);

    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Aura Campaigns <auth@fuadnafiz98.com>",
      to: [email],
      subject: `Your Aura Campaigns verification code`,
      html: `
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verify Your Email - Aura Campaigns</title>
          </head>
          <body style="margin: 0; padding: 0; background: #090909; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div style="width: 100%; max-width: 448px; padding: 2rem; margin: 0 auto;">
              <div style="background: #0a0a0a; border: 1px solid #27272a; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                <div style="text-align: center; margin-bottom: 2rem;">
                  <h1 style="color: #fafafa; font-size: 1.5rem; font-weight: 500; margin: 0 0 0.5rem 0;">Aura Campaigns</h1>
                  <h1 style="color: #fafafa; font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem 0;">Verify Your Email</h1>
                  <p style="color: #71717a; font-size: 0.875rem; margin: 0;">Enter the 6-digit code sent to your email</p>
                </div>

                <div style="text-align: center; margin: 2rem 0;">
                  <p style="color: #71717a; font-size: 0.875rem; margin: 0 0 1rem 0;">Verification Code</p>
                  <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem auto; display: inline-block;">
                    <div style="color: #ffffff; font-size: 2rem; font-weight: 700; letter-spacing: 0.5rem; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${token}</div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Your Aura Campaigns verification code is: ${token}. This code will expire in 15 minutes. Enter this code in the verification form to complete your account setup. If you didn't request this code, please ignore this email.`,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(JSON.stringify(error));
    }

    console.log(`OTP sent successfully to ${email}`);
  },
});
