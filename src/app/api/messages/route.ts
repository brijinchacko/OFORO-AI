import { NextRequest, NextResponse } from "next/server";
import { messageOps, friendsOps } from "@/lib/db";
import { sendMessageSchema, markReadSchema } from "@/lib/validations";

// GET /api/messages?friendId=xxx&since=ISO_DATE
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const friendId = searchParams.get("friendId");
  const since = searchParams.get("since");
  const action = searchParams.get("action");

  // Get unread counts for all conversations
  if (action === "unread") {
    const counts = await messageOps.getUnreadCounts(userId);
    return NextResponse.json({ counts });
  }

  if (!friendId) {
    return NextResponse.json({ error: "friendId is required" }, { status: 400 });
  }

  // Verify they are actually friends
  const areFriends = await friendsOps.areFriends(userId, friendId);
  if (!areFriends && friendId !== "oforo-ai-bot") {
    return NextResponse.json({ error: "Not friends" }, { status: 403 });
  }

  const messages = await messageOps.getConversation(
    userId,
    friendId,
    50,
    since ? new Date(since) : undefined
  );

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      receiverId: m.receiverId,
      content: m.content,
      type: m.type,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userName = req.headers.get("x-user-name") || "User";
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { friendId, content, type } = parsed.data;

    // Verify they are actually friends
    const areFriends = await friendsOps.areFriends(userId, friendId);
    if (!areFriends && friendId !== "oforo-ai-bot") {
      return NextResponse.json({ error: "Not friends" }, { status: 403 });
    }

    const message = await messageOps.send(userId, friendId, content, type);

    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        senderName: userName,
        receiverId: message.receiverId,
        content: message.content,
        type: message.type,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// PATCH /api/messages — mark messages as read
export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = markReadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await messageOps.markAsRead(userId, parsed.data.friendId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
