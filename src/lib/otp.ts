import { randomInt } from "crypto";
import { otpOps } from "./db";

const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a secure 6-digit OTP code
 */
export function generateOTP(): string {
  return randomInt(0, 1000000).toString().padStart(6, "0");
}

/**
 * Store an OTP code in the database
 */
export async function storeOTP(email: string, code: string, type: "signup" | "login"): Promise<void> {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // Invalidate previous unused OTPs for this email+type
  await otpOps.invalidatePrevious(email, type);

  await otpOps.create({
    email,
    code,
    type,
    expires_at: expiresAt,
  });
}

/**
 * Verify an OTP code — returns true if valid, marks as used
 */
export async function verifyOTP(email: string, code: string, type: "signup" | "login"): Promise<boolean> {
  const now = new Date();

  const otp = await otpOps.getByEmailAndCode(email, code);

  if (!otp) return false;
  if (otp.type !== type) return false;
  if (otp.expiresAt < now) return false;

  await otpOps.markUsed(otp.id);
  return true;
}

/**
 * Send OTP email via Resend API
 */
export async function sendOTPEmail(email: string, code: string, type: "signup" | "login"): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set");
    return { success: false, error: "Email service not configured" };
  }

  const subject = type === "signup" ? "Your Oforo AI verification code" : "Your Oforo AI sign-in code";
  const heading = type === "signup" ? "Verify your email" : "Sign in to Oforo AI";
  const description = type === "signup"
    ? "Use this code to complete your Oforo AI account registration."
    : "Use this code to sign in to your Oforo AI account.";

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;background:#1a1a1a;">
  <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:32px 20px;text-align:center;">
    <div style="font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Oforo AI</div>
  </div>
  <div style="padding:40px 32px;text-align:center;">
    <h1 style="font-size:22px;font-weight:600;color:#fff;margin:0 0 8px;">${heading}</h1>
    <p style="font-size:14px;color:#999;margin:0 0 28px;line-height:1.5;">${description}</p>
    <div style="background:#2a2a2a;border:2px solid #667eea;border-radius:12px;padding:28px 20px;margin:0 0 24px;">
      <div style="font-size:42px;font-weight:700;letter-spacing:10px;color:#667eea;font-family:Monaco,Menlo,monospace;">${code}</div>
      <p style="font-size:12px;color:#666;margin:14px 0 0;">This code expires in 10 minutes</p>
    </div>
    <p style="font-size:12px;color:#666;line-height:1.5;">If you didn't request this code, you can safely ignore this email.</p>
  </div>
  <div style="padding:16px 20px;text-align:center;border-top:1px solid #2a2a2a;">
    <p style="font-size:11px;color:#555;margin:0;">&copy; 2026 Oforo Ltd &middot; <a href="https://oforo.ai" style="color:#667eea;text-decoration:none;">oforo.ai</a></p>
  </div>
</div>
</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Oforo AI <hello@oforo.ai>", to: email, subject, html }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Resend error:", err);
      return { success: false, error: "Failed to send email" };
    }
    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: "Failed to send email" };
  }
}

/**
 * Cleanup expired OTP records
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  await otpOps.deleteExpired();
}
