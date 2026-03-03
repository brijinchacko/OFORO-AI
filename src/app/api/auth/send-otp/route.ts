import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP, sendOTPEmail, cleanupExpiredOTPs } from "@/lib/otp";
import { getUserByEmail } from "@/lib/auth";
import { sendOtpSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Zod validation
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, type } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check user existence (but don't reveal it to prevent account enumeration)
    const existing = await getUserByEmail(normalizedEmail);

    if (type === "signup" && existing) {
      // Don't reveal that account exists — return same success message
      return NextResponse.json({ success: true, message: "If this email is eligible, a verification code has been sent." });
    }

    if (type === "login" && !existing) {
      // Don't reveal that account doesn't exist — return same success message
      return NextResponse.json({ success: true, message: "If this email is eligible, a verification code has been sent." });
    }

    // Cleanup old OTPs periodically
    await cleanupExpiredOTPs();

    // Generate and store OTP
    const code = generateOTP();
    await storeOTP(normalizedEmail, code, type);

    // Send email
    const result = await sendOTPEmail(normalizedEmail, code, type);
    if (!result.success) {
      console.error("Failed to send OTP email:", result.error);
      return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "If this email is eligible, a verification code has been sent." });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
