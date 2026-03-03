import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth";
import { friendsOps, userOps } from "@/lib/db";
import { friendActionSchema } from "@/lib/validations";

const BOT_ID = "oforo-ai-bot";
const BOT_EMAIL = "bot@oforo.ai";
const BOT_NAME = "Oforo AI";

async function ensureBotExists() {
  const bot = await userOps.getById(BOT_ID);
  if (!bot) {
    await userOps.create({
      id: BOT_ID,
      email: BOT_EMAIL,
      name: BOT_NAME,
      password_hash: "",
      created_at: new Date().toISOString(),
      email_verified: 1,
    });
  }
}

async function ensureBotFriend(userId: string) {
  await ensureBotExists();
  const existing = await friendsOps.getByIds(userId, BOT_ID);
  const reverse = await friendsOps.getByIds(BOT_ID, userId);
  if (!existing && !reverse) {
    const now = new Date().toISOString();
    await friendsOps.create({ user_id: userId, friend_id: BOT_ID, status: "accepted", created_at: now, updated_at: now });
  }
}

function getAuthFromHeaders(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const email = req.headers.get("x-user-email");
  const name = req.headers.get("x-user-name");
  if (!userId || !email) return null;
  return { userId, email, name: name || "" };
}

export async function GET(req: NextRequest) {
  try {
    const user = getAuthFromHeaders(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const action = req.nextUrl.searchParams.get("action") || "list";

    if (action === "list") {
      // Auto-add Oforo AI bot as friend for every user
      await ensureBotFriend(user.userId);

      // Get accepted friends
      const friendships = await friendsOps.getAccepted(user.userId);
      const friends = await Promise.all(
        friendships.map(async (f: { userId: string; friendId: string; createdAt: Date }) => {
          const friendId = f.userId === user.userId ? f.friendId : f.userId;
          const friendUser = await userOps.getById(friendId);
          if (!friendUser) return null;
          const isBot = friendUser.id === BOT_ID;
          return {
            id: friendUser.id,
            name: friendUser.name,
            email: friendUser.email,
            avatar: isBot ? "O" : (friendUser.name?.charAt(0)?.toUpperCase() || "?"),
            addedAt: f.createdAt.toISOString(),
            isBot,
            bio: isBot ? "Your AI companion on Oforo — always here to help with questions, tasks, coding, research, and more." : undefined,
          };
        })
      );

      return NextResponse.json({ friends: friends.filter(Boolean) });
    }

    if (action === "requests") {
      // Get pending friend requests received
      const requests = await friendsOps.getPendingRequests(user.userId);
      const formatted = await Promise.all(
        requests.map(async (r: { userId: string; id: string; createdAt: Date }) => {
          const fromUser = await userOps.getById(r.userId);
          return fromUser ? {
            id: r.id,
            from: { id: fromUser.id, name: fromUser.name, email: fromUser.email, avatar: fromUser.name?.charAt(0)?.toUpperCase() || "?" },
            timestamp: r.createdAt.toISOString(),
            status: "pending",
          } : null;
        })
      );

      return NextResponse.json({ requests: formatted.filter(Boolean) });
    }

    if (action === "sent") {
      const sent = await friendsOps.getSentRequests(user.userId);
      const formatted = await Promise.all(
        sent.map(async (r: { friendId: string; id: string; createdAt: Date }) => {
          const toUser = await userOps.getById(r.friendId);
          return toUser ? {
            id: r.id,
            to: { id: toUser.id, name: toUser.name, email: toUser.email },
            timestamp: r.createdAt.toISOString(),
            status: "pending",
          } : null;
        })
      );

      return NextResponse.json({ sent: formatted.filter(Boolean) });
    }

    if (action === "search") {
      const query = req.nextUrl.searchParams.get("q") || "";
      if (!query || query.length < 2) return NextResponse.json({ users: [] });

      const results = await userOps.searchByQuery(query, [user.userId, BOT_ID]);
      const formatted = results.map((u: { id: string; name: string | null; email: string }) => ({
        id: u.id, name: u.name, email: u.email, avatar: u.name?.charAt(0)?.toUpperCase() || "?",
      }));

      return NextResponse.json({ users: formatted });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Friends GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthFromHeaders(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Zod validation
    const parsed = friendActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { action, email, friendId } = parsed.data;
    const requestId = body.requestId; // Not in Zod schema, handle separately

    // ── Send friend request by email ──
    if (action === "send-request") {
      if (!email && !friendId) return NextResponse.json({ error: "Email or friendId required" }, { status: 400 });

      let targetUser;
      if (email) {
        targetUser = await getUserByEmail(email);
        if (!targetUser) return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
      } else {
        targetUser = await userOps.getById(friendId!);
        if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (targetUser.id === user.userId) return NextResponse.json({ error: "You can't add yourself" }, { status: 400 });

      // Check if already friends or request pending
      const existing = await friendsOps.getByIds(user.userId, targetUser.id);
      const reverse = await friendsOps.getByIds(targetUser.id, user.userId);

      if (existing?.status === "accepted" || reverse?.status === "accepted") {
        return NextResponse.json({ error: "Already friends" }, { status: 409 });
      }
      if (existing?.status === "pending") {
        return NextResponse.json({ error: "Request already sent" }, { status: 409 });
      }
      if (reverse?.status === "pending") {
        // They already sent us a request — auto-accept
        await friendsOps.updateStatus(targetUser.id, user.userId, "accepted");
        return NextResponse.json({ success: true, message: "Friend request accepted!" });
      }

      const now = new Date().toISOString();
      await friendsOps.create({ user_id: user.userId, friend_id: targetUser.id, status: "pending", created_at: now, updated_at: now });

      return NextResponse.json({ success: true, message: "Friend request sent!" });
    }

    // ── Accept friend request ──
    if (action === "accept") {
      if (!requestId && !friendId) return NextResponse.json({ error: "requestId or friendId required" }, { status: 400 });

      const senderId = friendId || requestId;
      await friendsOps.updateStatus(senderId, user.userId, "accepted");
      return NextResponse.json({ success: true });
    }

    // ── Decline friend request ──
    if (action === "decline") {
      if (!friendId) return NextResponse.json({ error: "friendId required" }, { status: 400 });
      await friendsOps.updateStatus(friendId, user.userId, "declined");
      return NextResponse.json({ success: true });
    }

    // ── Remove friend ──
    if (action === "remove") {
      if (!friendId) return NextResponse.json({ error: "friendId required" }, { status: 400 });
      if (friendId === BOT_ID) return NextResponse.json({ error: "Cannot remove Oforo AI bot" }, { status: 400 });
      await friendsOps.delete(user.userId, friendId);
      await friendsOps.delete(friendId, user.userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Friends POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
