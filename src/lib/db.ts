import prisma from "./prisma";
import type { User, OtpCode, Friend } from "../../generated/prisma/client";

export type { User, OtpCode, Friend };

// ── User operations ──
export const userOps = {
  create: async (user: {
    id?: string;
    email: string;
    name?: string;
    password_hash?: string;
    created_at?: string;
    email_verified?: number | boolean;
  }) => {
    return prisma.user.create({
      data: {
        ...(user.id ? { id: user.id } : {}),
        email: user.email,
        name: user.name || null,
        passwordHash: user.password_hash || null,
        emailVerified: user.email_verified ? true : false,
      },
    });
  },

  getById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  getByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    // Map to legacy field names for backward compatibility
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.passwordHash,
      created_at: user.createdAt.toISOString(),
      email_verified: user.emailVerified ? 1 : 0,
    };
  },

  update: async (
    id: string,
    updates: {
      email?: string;
      name?: string;
      password_hash?: string;
      email_verified?: number | boolean;
    }
  ) => {
    const data: Record<string, unknown> = {};
    if (updates.email !== undefined) data.email = updates.email;
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.password_hash !== undefined) data.passwordHash = updates.password_hash;
    if (updates.email_verified !== undefined) data.emailVerified = updates.email_verified ? true : false;

    return prisma.user.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.user.delete({ where: { id } });
  },

  getAll: async () => {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
    });
  },

  searchByQuery: async (query: string, excludeIds: string[], limit = 10) => {
    return prisma.user.findMany({
      where: {
        AND: [
          { id: { notIn: excludeIds } },
          {
            OR: [
              { email: { contains: query.toLowerCase() } },
              { name: { contains: query.toLowerCase() } },
            ],
          },
        ],
      },
      take: limit,
      select: { id: true, name: true, email: true },
    });
  },
};

// ── OTP operations ──
export const otpOps = {
  create: async (otp: {
    email: string;
    code: string;
    type: "signup" | "login";
    expires_at: string;
    created_at?: string;
  }) => {
    return prisma.otpCode.create({
      data: {
        email: otp.email,
        code: otp.code,
        type: otp.type,
        expiresAt: new Date(otp.expires_at),
      },
    });
  },

  getByEmailAndCode: async (email: string, code: string) => {
    return prisma.otpCode.findFirst({
      where: { email, code, used: false },
      orderBy: { createdAt: "desc" },
    });
  },

  getLatestByEmail: async (email: string) => {
    return prisma.otpCode.findFirst({
      where: { email, used: false },
      orderBy: { createdAt: "desc" },
    });
  },

  markUsed: async (id: string) => {
    return prisma.otpCode.update({
      where: { id },
      data: { used: true },
    });
  },

  invalidatePrevious: async (email: string, type: "signup" | "login") => {
    return prisma.otpCode.updateMany({
      where: { email, type, used: false },
      data: { used: true },
    });
  },

  deleteExpired: async () => {
    return prisma.otpCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },

  deleteByEmail: async (email: string) => {
    return prisma.otpCode.deleteMany({ where: { email } });
  },
};

// ── Friends operations ──
export const friendsOps = {
  create: async (friendship: {
    user_id: string;
    friend_id: string;
    status: "pending" | "accepted" | "declined";
    created_at?: string;
    updated_at?: string;
  }) => {
    return prisma.friend.create({
      data: {
        userId: friendship.user_id,
        friendId: friendship.friend_id,
        status: friendship.status,
      },
    });
  },

  getByIds: async (userId: string, friendId: string) => {
    return prisma.friend.findUnique({
      where: { userId_friendId: { userId, friendId } },
    });
  },

  getPendingRequests: async (userId: string) => {
    return prisma.friend.findMany({
      where: { friendId: userId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });
  },

  getAccepted: async (userId: string) => {
    return prisma.friend.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: "accepted",
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  getSentRequests: async (userId: string) => {
    return prisma.friend.findMany({
      where: { userId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus: async (
    userId: string,
    friendId: string,
    status: "pending" | "accepted" | "declined"
  ) => {
    return prisma.friend.update({
      where: { userId_friendId: { userId, friendId } },
      data: { status },
    });
  },

  delete: async (userId: string, friendId: string) => {
    return prisma.friend.delete({
      where: { userId_friendId: { userId, friendId } },
    }).catch(() => null);
  },

  areFriends: async (userId: string, friendId: string): Promise<boolean> => {
    const count = await prisma.friend.count({
      where: {
        OR: [
          { userId, friendId, status: "accepted" },
          { userId: friendId, friendId: userId, status: "accepted" },
        ],
      },
    });
    return count > 0;
  },

  getAll: async (userId: string) => {
    return prisma.friend.findMany({
      where: { OR: [{ userId }, { friendId: userId }] },
      orderBy: { updatedAt: "desc" },
    });
  },
};

// ── Direct message operations ──
export const messageOps = {
  send: async (senderId: string, receiverId: string, content: string, type = "text") => {
    return prisma.directMessage.create({
      data: { senderId, receiverId, content, type },
    });
  },

  getConversation: async (userId: string, friendId: string, limit = 50, since?: Date) => {
    return prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
        ...(since ? { createdAt: { gt: since } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  },

  markAsRead: async (receiverId: string, senderId: string) => {
    return prisma.directMessage.updateMany({
      where: { senderId, receiverId, read: false },
      data: { read: true },
    });
  },

  getUnreadCounts: async (userId: string) => {
    const results = await prisma.directMessage.groupBy({
      by: ["senderId"],
      where: { receiverId: userId, read: false },
      _count: { id: true },
    });
    return results.map((r) => ({ friendId: r.senderId, count: r._count.id }));
  },
};

export default { userOps, otpOps, friendsOps, messageOps };
