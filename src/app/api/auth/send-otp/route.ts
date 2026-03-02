import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP, sendOTPEmail, cleanupExpiredOTPs } from "@/lib/otp";
import { getUserByEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json();

    if (!email || !type || !["signup", "login"].includes(type)) {
      return NextResponse.json({ error: "Email and type (signup/login) are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // For signup: make sure user doesn't already exist
    if (type === "signup") {
      const existing = getUserByEmail(normalizedEmail);
      if (existing) {
        return NextResponse.json({ error: "An account with this email already exists. Please sign in instead." }, { status: 409 });
      }
    }

    // For login: make sure user exists
    if (type === "login") {
      const existing = getUserByEmail(normalizedEmail);
      if (!existing) {
        return NextResponse.json({ error: "No account found with this email. Please sign up first." }, { status: 404 });
      }
    }

    // Cleanup old OTPs periodically
    cleanupExpiredOTPs();

    // Generate and store OTP
    const code = generateOTP();
    storeOTP(normalizedEmail, code, type);

    // Send email
    const result = await sendOTPEmail(normalizedEmail, code, type);
    if (!result.success) {
      console.error("Failed to send OTP email:", result.error);
      return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
