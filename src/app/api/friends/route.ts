import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserByEmail } from "@/lib/auth";
import { friendsOps, userOps } from "@/lib/db";

function getUser(req: NextRequest) {
  const token = req.cookies.get("oforo-token")?.value;
  if (!token) return null;
  // verifyToken is async but we need sync — use a workaround
  return token;
}

async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get("oforo-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const action = req.nextUrl.searchParams.get("action") || "list";

    if (action === "list") {
      // Get accepted friends
      const friendships = friendsOps.getAccepted(user.userId);
      const friends = friendships.map((f: { user_id: string; friend_id: string; created_at: string }) => {
        const friendId = f.user_id === user.userId ? f.friend_id : f.user_id;
        const friendUser = userOps.getById(friendId);
        return friendUser ? {
          id: friendUser.id,
          name: friendUser.name,
          email: friendUser.email,
          avatar: friendUser.name?.charAt(0)?.toUpperCase() || "?",
          addedAt: f.created_at,
        } : null;
      }).filter(Boolean);

      return NextResponse.json({ friends });
    }

    if (action === "requests") {
      // Get pending friend requests received
      const requests = friendsOps.getPendingRequests(user.userId);
      const formatted = requests.map((r: { user_id: string; id: number; created_at: string }) => {
        const fromUser = userOps.getById(r.user_id);
        return fromUser ? {
          id: r.id,
          from: { id: fromUser.id, name: fromUser.name, email: fromUser.email, avatar: fromUser.name?.charAt(0)?.toUpperCase() || "?" },
          timestamp: r.created_at,
          status: "pending",
        } : null;
      }).filter(Boolean);

      return NextResponse.json({ requests: formatted });
    }

    if (action === "sent") {
      const sent = friendsOps.getSentRequests(user.userId);
      const formatted = sent.map((r: { friend_id: string; id: number; created_at: string }) => {
        const toUser = userOps.getById(r.friend_id);
        return toUser ? {
          id: r.id,
          to: { id: toUser.id, name: toUser.name, email: toUser.email },
          timestamp: r.created_at,
          status: "pending",
        } : null;
      }).filter(Boolean);

      return NextResponse.json({ sent: formatted });
    }

    if (action === "search") {
      const query = req.nextUrl.searchParams.get("q") || "";
      if (!query || query.length < 2) return NextResponse.json({ users: [] });

      const allUsers = userOps.getAll();
      const results = allUsers.filter((u: { id: string; email: string; name: string }) =>
        u.id !== user.userId &&
        (u.email.includes(query.toLowerCase()) || u.name?.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10).map((u: { id: string; name: string; email: string }) => ({
        id: u.id, name: u.name, email: u.email, avatar: u.name?.charAt(0)?.toUpperCase() || "?",
      }));

      return NextResponse.json({ users: results });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Friends GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, email, friendId, requestId } = await req.json();

    // ── Send friend request by email ──
    if (action === "send-request") {
      if (!email && !friendId) return NextResponse.json({ error: "Email or friendId required" }, { status: 400 });

      let targetUser;
      if (email) {
        targetUser = getUserByEmail(email);
        if (!targetUser) return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
      } else {
        targetUser = userOps.getById(friendId);
        if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (targetUser.id === user.userId) return NextResponse.json({ error: "You can't add yourself" }, { status: 400 });

      // Check if already friends or request pending
      const existing = friendsOps.getByIds(user.userId, targetUser.id);
      const reverse = friendsOps.getByIds(targetUser.id, user.userId);

      if (existing?.status === "accepted" || reverse?.status === "accepted") {
        return NextResponse.json({ error: "Already friends" }, { status: 409 });
      }
      if (existing?.status === "pending") {
        return NextResponse.json({ error: "Request already sent" }, { status: 409 });
      }
      if (reverse?.status === "pending") {
        // They already sent us a request — auto-accept
        friendsOps.updateStatus(targetUser.id, user.userId, "accepted");
        return NextResponse.json({ success: true, message: "Friend request accepted!" });
      }

      const now = new Date().toISOString();
      friendsOps.create({ user_id: user.userId, friend_id: targetUser.id, status: "pending", created_at: now, updated_at: now });

      return NextResponse.json({ success: true, message: "Friend request sent!" });
    }

    // ── Accept friend request ──
    if (action === "accept") {
      if (!requestId && !friendId) return NextResponse.json({ error: "requestId or friendId required" }, { status: 400 });

      const senderId = friendId || requestId;
      friendsOps.updateStatus(senderId, user.userId, "accepted");
      return NextResponse.json({ success: true });
    }

    // ── Decline friend request ──
    if (action === "decline") {
      if (!friendId) return NextResponse.json({ error: "friendId required" }, { status: 400 });
      friendsOps.updateStatus(friendId, user.userId, "declined");
      return NextResponse.json({ success: true });
    }

    // ── Remove friend ──
    if (action === "remove") {
      if (!friendId) return NextResponse.json({ error: "friendId required" }, { status: 400 });
      friendsOps.delete(user.userId, friendId);
      friendsOps.delete(friendId, user.userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Friends POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
