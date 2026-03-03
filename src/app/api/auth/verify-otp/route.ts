import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { createUser, createToken, getUserByEmail } from "@/lib/auth";
import { verifyOtpSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Zod validation
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, code, type, name, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify the OTP
    const valid = await verifyOTP(normalizedEmail, code, type);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired code. Please request a new one." }, { status: 401 });
    }

    // ── SIGNUP: create account after OTP verification ──
    if (type === "signup") {
      if (!name || !password) {
        return NextResponse.json({ error: "Name and password are required for signup" }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }

      const result = await createUser(normalizedEmail, password, name);
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 409 });
      }

      const response = NextResponse.json({ user: result.user, verified: true });
      response.cookies.set("oforo-token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    // ── LOGIN: issue token after OTP verification ──
    if (type === "login") {
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const token = await createToken({ userId: user.id, email: user.email, name: user.name || "" });
      const response = NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
        verified: true,
      });
      response.cookies.set("oforo-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
