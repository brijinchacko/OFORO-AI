import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

/**
 * Get or initialize the SQLite database
 */
export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  // Determine the database path
  const isProd = process.env.NODE_ENV === 'production';
  const dbPath = isProd
    ? '/var/www/oforo-website/data/oforo.db'
    : path.join(process.cwd(), 'data', 'oforo.db');

  // Ensure the directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Initialize the database
  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Initialize all tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      created_at TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('signup', 'login')),
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
    CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      friend_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'declined')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, friend_id)
    );
    CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
    CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
  `);

  return db;
}

/**
 * Close the database connection
 * Useful for cleanup and testing
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * User operations
 */
export const userOps = {
  /**
   * Create a new user
   */
  create: (user: {
    id: string;
    email: string;
    name?: string;
    password_hash?: string;
    created_at: string;
    email_verified?: number;
  }) => {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO users (id, email, name, password_hash, created_at, email_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      user.id,
      user.email,
      user.name || null,
      user.password_hash || null,
      user.created_at,
      user.email_verified || 0
    );
  },

  /**
   * Get user by ID
   */
  getById: (id: string) => {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as any;
  },

  /**
   * Get user by email
   */
  getByEmail: (email: string) => {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as any;
  },

  /**
   * Update user
   */
  update: (
    id: string,
    updates: {
      email?: string;
      name?: string;
      password_hash?: string;
      email_verified?: number;
    }
  ) => {
    const database = getDb();

    const fields = Object.keys(updates)
      .filter((key) => key !== 'id')
      .map((key) => `${key} = ?`);

    if (fields.length === 0) {
      return { changes: 0 };
    }

    const values = Object.keys(updates)
      .filter((key) => key !== 'id')
      .map((key) => updates[key as keyof typeof updates]);

    const stmt = database.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    return stmt.run(...values, id);
  },

  /**
   * Delete user by ID
   */
  delete: (id: string) => {
    const database = getDb();
    const stmt = database.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Get all users
   */
  getAll: () => {
    const database = getDb();
    const stmt = database.prepare('SELECT * FROM users');
    return stmt.all() as any[];
  },
};

/**
 * OTP operations
 */
export const otpOps = {
  /**
   * Create a new OTP code
   */
  create: (otp: {
    email: string;
    code: string;
    type: 'signup' | 'login';
    expires_at: string;
    created_at: string;
  }) => {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO otp_codes (email, code, type, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(otp.email, otp.code, otp.type, otp.expires_at, otp.created_at);
  },

  /**
   * Get OTP code by email and code
   */
  getByEmailAndCode: (email: string, code: string) => {
    const database = getDb();
    const stmt = database.prepare(
      'SELECT * FROM otp_codes WHERE email = ? AND code = ? AND used = 0'
    );
    return stmt.get(email, code) as any;
  },

  /**
   * Get latest unused OTP for an email
   */
  getLatestByEmail: (email: string) => {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT * FROM otp_codes
      WHERE email = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return stmt.get(email) as any;
  },

  /**
   * Mark OTP as used
   */
  markUsed: (id: number) => {
    const database = getDb();
    const stmt = database.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Delete expired OTP codes
   */
  deleteExpired: () => {
    const database = getDb();
    const stmt = database.prepare(
      'DELETE FROM otp_codes WHERE expires_at < datetime("now")'
    );
    return stmt.run();
  },

  /**
   * Delete OTP by ID
   */
  delete: (id: number) => {
    const database = getDb();
    const stmt = database.prepare('DELETE FROM otp_codes WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Delete all OTP codes for an email
   */
  deleteByEmail: (email: string) => {
    const database = getDb();
    const stmt = database.prepare('DELETE FROM otp_codes WHERE email = ?');
    return stmt.run(email);
  },
};

/**
 * Friends operations
 */
export const friendsOps = {
  /**
   * Create a friend request or relationship
   */
  create: (friendship: {
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string;
    updated_at: string;
  }) => {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO friends (user_id, friend_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      friendship.user_id,
      friendship.friend_id,
      friendship.status,
      friendship.created_at,
      friendship.updated_at
    );
  },

  /**
   * Get friendship by user_id and friend_id
   */
  getByIds: (user_id: string, friend_id: string) => {
    const database = getDb();
    const stmt = database.prepare(
      'SELECT * FROM friends WHERE user_id = ? AND friend_id = ?'
    );
    return stmt.get(user_id, friend_id) as any;
  },

  /**
   * Get all friend requests for a user (pending status)
   */
  getPendingRequests: (user_id: string) => {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT * FROM friends
      WHERE friend_id = ? AND status = 'pending'
      ORDER BY created_at DESC
    `);
    return stmt.all(user_id) as any[];
  },

  /**
   * Get all accepted friends for a user
   */
  getAccepted: (user_id: string) => {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT * FROM friends
      WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
      ORDER BY updated_at DESC
    `);
    return stmt.all(user_id, user_id) as any[];
  },

  /**
   * Get pending requests sent by a user
   */
  getSentRequests: (user_id: string) => {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT * FROM friends
      WHERE user_id = ? AND status = 'pending'
      ORDER BY created_at DESC
    `);
    return stmt.all(user_id) as any[];
  },

  /**
   * Update friendship status
   */
  updateStatus: (
    user_id: string,
    friend_id: string,
    status: 'pending' | 'accepted' | 'declined'
  ) => {
    const database = getDb();
    const stmt = database.prepare(`
      UPDATE friends
      SET status = ?, updated_at = ?
      WHERE user_id = ? AND friend_id = ?
    `);

    return stmt.run(status, new Date().toISOString(), user_id, friend_id);
  },

  /**
   * Delete friendship
   */
  delete: (user_id: string, friend_id: string) => {
    const database = getDb();
    const stmt = database.prepare(
      'DELETE FROM friends WHERE user_id = ? AND friend_id = ?'
    );
    return stmt.run(user_id, friend_id);
  },

  /**
   * Check if users are friends (accepted status)
   */
  areFriends: (user_id: string, friend_id: string): boolean => {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT COUNT(*) as count FROM friends
      WHERE (user_id = ? AND friend_id = ? OR user_id = ? AND friend_id = ?)
      AND status = 'accepted'
    `);

    const result = stmt.get(user_id, friend_id, friend_id, user_id) as any;
    return result.count > 0;
  },

  /**
   * Get all friends and friend requests for a user (both directions)
   */
  getAll: (user_id: string) => {
    const database = getDb();
    const stmt = database.prepare(`
      SELECT * FROM friends
      WHERE user_id = ? OR friend_id = ?
      ORDER BY updated_at DESC
    `);
    return stmt.all(user_id, user_id) as any[];
  },
};

export default {
  getDb,
  closeDb,
  userOps,
  otpOps,
  friendsOps,
};
