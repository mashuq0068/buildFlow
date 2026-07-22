import nodemailer from "nodemailer";
import { config } from "../config";

const transporter =
  config.smtp.host && config.smtp.user
    ? nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
      })
    : null;

export async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.warn(`[mailer] SMTP not configured — skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    await transporter.sendMail({
      from: config.smtp.from,
      replyTo: config.smtp.replyTo,
      to,
      subject,
      html,
    });
    console.log(`[mailer] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
  }
}

export function inviteEmailHtml(params: {
  inviterName: string;
  workspaceName: string;
  role: string;
  acceptUrl: string;
}) {
  const roleLabel = params.role === "ADMIN" ? "an admin" : "a member";
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="margin-bottom: 4px;">You're invited to join ${params.workspaceName}</h2>
      <p style="color: #444; line-height: 1.5;">
        ${params.inviterName} invited you to join <strong>${params.workspaceName}</strong> as ${roleLabel} on BuildFlow.
      </p>
      <p style="margin: 24px 0;">
        <a href="${params.acceptUrl}"
           style="display:inline-block;background:#111;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:600;">
          Accept invitation
        </a>
      </p>
      <p style="color:#888;font-size:12px;">
        This invitation expires in 7 days. If you weren't expecting this, you can safely ignore this email.
      </p>
    </div>
  `;
}
