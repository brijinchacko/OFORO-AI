import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler for Microsoft To Do
 * Receives the auth code and redirects back to app with it
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?ms_todo_error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?ms_todo_error=no_code", req.url));
  }

  // Redirect back to the app with the code in the URL
  return NextResponse.redirect(
    new URL(`/?ms_todo_code=${encodeURIComponent(code)}`, req.url)
  );
}
