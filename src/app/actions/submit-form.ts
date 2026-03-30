"use server";

import { Resend } from "resend";
import dns from "dns/promises";
import type { FormData } from "@/types/form";

interface SubmitResult {
  success: boolean;
  message: string;
}

function buildEmailHtml(data: FormData): string {
  const name = String(data.name ?? "");
  const email = String(data.email ?? "");
  const phone = String(data.phone ?? "");
  const profileType = String(data.profileType ?? "");
  const ageRange = String(data.ageRange ?? "—");
  const goals = String(data.goals ?? "");
  const timestamp = new Date().toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" });

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:12px 16px;background:#f9f9f9;border-bottom:1px solid #eee;width:160px;vertical-align:top;">
        <span style="font-family:sans-serif;font-size:13px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;">${label}</span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;vertical-align:top;">
        <span style="font-family:sans-serif;font-size:15px;color:#111;">${value}</span>
      </td>
    </tr>`;

  const dataConsent = data.dataConsent === true ? "Yes ✓" : "No";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#CA132A,#EA3860);padding:32px 32px 28px;">
            <p style="margin:0;font-family:sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Coaching Inquiry</p>
            <h1 style="margin:8px 0 0;font-family:sans-serif;font-size:24px;font-weight:800;color:#fff;">New Application</h1>
          </td>
        </tr>

        <!-- Fields -->
        <tr>
          <td style="background:#fff;padding:8px 16px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("Name", name)}
              ${row("Email", email)}
              ${row("Phone", phone)}
              ${row("Profile", profileType)}
              ${row("Age Range", ageRange)}
              ${row("Data Consent", dataConsent)}
            </table>
          </td>
        </tr>

        <!-- Goals -->
        <tr>
          <td style="background:#fff;padding:0 32px 24px;">
            <p style="margin:24px 0 8px;font-family:sans-serif;font-size:13px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Goals</p>
            <blockquote style="margin:0;padding:16px 20px;background:#fdf2f4;border-left:4px solid #CA132A;border-radius:0 6px 6px 0;">
              <p style="margin:0;font-family:sans-serif;font-size:15px;color:#111;line-height:1.6;white-space:pre-wrap;">${goals}</p>
            </blockquote>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eee;padding:16px 32px;">
            <p style="margin:0;font-family:sans-serif;font-size:12px;color:#999;">Submitted ${timestamp} UTC</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function submitForm(data: FormData): Promise<SubmitResult> {
  try {
    const apiKey = process.env.EMAIL_API_KEY;
    const toAddress = process.env.EMAIL_ADDRESS_TO;

    if (!apiKey || !toAddress) {
      console.error("Missing EMAIL_API_KEY or EMAIL_ADDRESS_TO environment variables.");
      return { success: false, message: "Email service is not configured." };
    }

    if (!data.name || !data.email || !data.phone) {
      return { success: false, message: "Missing required contact fields." };
    }

    if (!data.profileType) {
      return { success: false, message: "Missing profile type." };
    }

    if (!data.goals) {
      return { success: false, message: "Missing goals." };
    }

    if (data.dataConsent !== true) {
      return { success: false, message: "Data consent is required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(data.email))) {
      return { success: false, message: "Invalid email address." };
    }

    // DNS MX lookup — verify the email domain accepts mail
    try {
      const domain = String(data.email).split("@")[1];
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return { success: false, message: "Invalid email address." };
      }
    } catch {
      return { success: false, message: "Invalid email address." };
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toAddress,
      subject: `New Coaching Inquiry from ${data.name}`,
      html: buildEmailHtml(data),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, message: "Failed to send email." };
    }

    return { success: true, message: "Form submitted successfully." };
  } catch (error) {
    console.error("Form submission error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
