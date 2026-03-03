import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-secret-not-for-production"
);

// Routes that STRICTLY require authentication (user-specific features)
const PROTECTED_API_ROUTES = [
  "/api/upload",
  "/api/friends",
  "/api/todo",
  "/api/messages",
];

// Routes that work without auth but get user info if available
const OPTIONAL_AUTH_ROUTES = [
  "/api/chat",
  "/api/search",
  "/api/images",
];

// Rate limiting store (in-memory — resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/chat": { max: 30, windowMs: 60_000 },
  "/api/search": { max: 60, windowMs: 60_000 },
  "/api/images": { max: 30, windowMs: 60_000 },
  "/api/auth/send-otp": { max: 5, windowMs: 300_000 }, // 5 per 5 min
  "/api/auth/verify-otp": { max: 10, windowMs: 300_000 },
  "/api/contact": { max: 3, windowMs: 300_000 },
};

function getRateLimitKey(ip: string, path: string): string {
  // Match the most specific rate limit path
  const matchedPath = Object.keys(RATE_LIMITS).find((p) => path.startsWith(p));
  return `${ip}:${matchedPath || path}`;
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; retryAfter?: number } {
  const matchedPath = Object.keys(RATE_LIMITS).find((p) => path.startsWith(p));
  if (!matchedPath) return { allowed: true };

  const limit = RATE_LIMITS[matchedPath];
  const key = getRateLimitKey(ip, path);
  const now = Date.now();

  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + limit.windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit.max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

async function verifyAuth(req: NextRequest): Promise<{ userId: string; email: string; name: string } | null> {
  const token = req.cookies.get("oforo-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; name: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get client IP for rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const rateResult = checkRateLimit(ip, pathname);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateResult.retryAfter || 60) },
        }
      );
    }
  }

  // Authentication check for protected API routes (strict — 401 if not logged in)
  const isProtected = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected) {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Attach user info to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set("x-user-id", user.userId);
    response.headers.set("x-user-email", user.email);
    response.headers.set("x-user-name", user.name);
    return response;
  }

  // Optional auth routes — work without login, but pass user info if available
  const isOptionalAuth = OPTIONAL_AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isOptionalAuth) {
    const user = await verifyAuth(req);
    if (user) {
      const response = NextResponse.next();
      response.headers.set("x-user-id", user.userId);
      response.headers.set("x-user-email", user.email);
      response.headers.set("x-user-name", user.name);
      return response;
    }
    // Allow unauthenticated access (rate limiting still applies above)
    return NextResponse.next();
  }

  // Redirect unauthenticated users from settings
  if (pathname === "/settings") {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/settings",
  ],
};
