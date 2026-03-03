import { NextResponse } from "next/server";

// This route has been disabled — authentication is handled via OTP only.
// Direct login bypasses OTP verification and is a security risk.

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been disabled. Please use OTP-based authentication." },
    { status: 404 }
  );
}
