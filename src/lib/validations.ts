import { z } from "zod";

// ── Auth validations ──
export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  type: z.enum(["signup", "login"]),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  code: z.string().length(6).regex(/^\d{6}$/, "OTP must be 6 digits"),
  type: z.enum(["signup", "login"]),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128).optional(),
});

// ── Chat validations ──
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(50000),
});

export const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(100),
  modelId: z.string().max(50).optional(),
  searchContext: z.string().max(100000).optional(),
  language: z.string().max(10).optional(),
});

// ── Search validations ──
export const searchSchema = z.object({
  query: z.string().min(1, "Query is required").max(500),
});

// ── Upload validations ──
export const uploadSchema = z.object({
  filename: z.string().max(255),
  size: z.number().max(10 * 1024 * 1024, "File too large (max 10MB)"),
});

// ── Friends validations ──
export const friendActionSchema = z.object({
  action: z.enum(["send-request", "accept", "decline", "remove", "search"]),
  friendId: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  query: z.string().max(100).optional(),
});

// ── Direct messages ──
export const sendMessageSchema = z.object({
  friendId: z.string().min(1, "Friend ID is required").max(100),
  content: z.string().min(1, "Message cannot be empty").max(5000),
  type: z.enum(["text", "thread-link", "canvas-link"]).default("text"),
});

export const getMessagesSchema = z.object({
  friendId: z.string().min(1).max(100),
  since: z.string().datetime().optional(),
});

export const markReadSchema = z.object({
  friendId: z.string().min(1).max(100),
});

// ── Contact form ──
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});
