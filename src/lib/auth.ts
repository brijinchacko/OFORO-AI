import { SignJWT, jwtVerify } from "jose";
import { userOps } from "./db";

// ── JWT Secret — MUST be set in environment ──
const jwtSecretValue = process.env.JWT_SECRET;
if (!jwtSecretValue && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const JWT_SECRET = new TextEncoder().encode(
  jwtSecretValue || "dev-only-secret-not-for-production"
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

// ── Password validation ──
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password must be less than 128 characters" };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain both letters and numbers" };
  }
  return { valid: true };
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

// ── User creation (called after OTP verification on signup) ──
export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<{ user: { id: string; email: string; name: string; createdAt: string }; token: string } | { error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Validate password strength
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return { error: passwordCheck.error! };
  }

  const existing = await userOps.getByEmail(normalizedEmail);
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(password);
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  await userOps.create({ id, email: normalizedEmail, name: name.trim(), password_hash: passwordHash, created_at: createdAt, email_verified: 1 });

  const token = await createToken({ userId: id, email: normalizedEmail, name: name.trim() });
  return { user: { id, email: normalizedEmail, name: name.trim(), createdAt }, token };
}

// ── Get user by email (for OTP flow) ──
export async function getUserByEmail(email: string) {
  return userOps.getByEmail(email.toLowerCase().trim());
}

// ── Get user by ID ──
export async function getUserById(id: string) {
  return userOps.getById(id);
}
