import { SignJWT, jwtVerify } from "jose";
import { userOps } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "oforo-jwt-secret-change-me-in-production-2026"
);

// ── Password hashing (Web Crypto, no deps) ──
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  const computedHex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return computedHex === hashHex;
}

// ── JWT ──
export async function createToken(payload: { userId: string; email: string; name: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; name: string };
  } catch {
    return null;
  }
}

// ── User creation (with password — called after OTP verification on signup) ──
export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<{ user: { id: string; email: string; name: string; createdAt: string }; token: string } | { error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = userOps.getByEmail(normalizedEmail);
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(password);
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  userOps.create({ id, email: normalizedEmail, name: name.trim(), password_hash: passwordHash, created_at: createdAt, email_verified: 1 });

  const token = await createToken({ userId: id, email: normalizedEmail, name: name.trim() });
  return { user: { id, email: normalizedEmail, name: name.trim(), createdAt }, token };
}

// ── Login with password ──
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: { id: string; email: string; name: string }; token: string } | { error: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = userOps.getByEmail(normalizedEmail);

  if (!user || !user.password_hash) {
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  const token = await createToken({ userId: user.id, email: user.email, name: user.name });
  return { user: { id: user.id, email: user.email, name: user.name }, token };
}

// ── Get user by email (for OTP flow) ──
export function getUserByEmail(email: string) {
  return userOps.getByEmail(email.toLowerCase().trim());
}

// ── Get user by ID ──
export function getUserById(id: string) {
  return userOps.getById(id);
}
