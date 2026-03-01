import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "oforo-jwt-secret-change-me-in-production-2026"
);

// In-memory user store (replace with a database in production)
interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

// Simple in-memory store — in production, use a real database
const users: Map<string, StoredUser> = new Map();

// Simple password hashing using Web Crypto (no external deps needed)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, 256
  );
  const computedHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  return computedHex === hashHex;
}

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

export async function createUser(email: string, password: string, name: string): Promise<{ user: Omit<StoredUser, "passwordHash">; token: string } | { error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (users.has(normalizedEmail)) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(password);
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const user: StoredUser = {
    id,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.set(normalizedEmail, user);

  const token = await createToken({ userId: id, email: normalizedEmail, name: user.name });
  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, token };
}

export async function authenticateUser(email: string, password: string): Promise<{ user: Omit<StoredUser, "passwordHash">; token: string } | { error: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.get(normalizedEmail);

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  const token = await createToken({ userId: user.id, email: user.email, name: user.name });
  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, token };
}
