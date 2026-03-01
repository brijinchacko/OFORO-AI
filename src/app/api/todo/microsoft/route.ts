import { NextRequest, NextResponse } from "next/server";

/**
 * Microsoft To Do integration via Microsoft Graph API
 *
 * Endpoints:
 *  POST /api/todo/microsoft
 *    action: "auth-url"   → returns OAuth URL to sign in
 *    action: "callback"   → exchanges code for token
 *    action: "sync"       → pushes todos to Microsoft To Do
 *    action: "fetch"      → fetches todos from Microsoft To Do
 */

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/todo/microsoft/callback`;
const SCOPES = "Tasks.ReadWrite offline_access";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, accessToken, todos } = body;

    // ── Generate OAuth URL ──
    if (action === "auth-url") {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        response_mode: "query",
      });
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
      return NextResponse.json({ url: authUrl });
    }

    // ── Exchange code for token ──
    if (action === "callback") {
      if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

      const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
          scope: SCOPES,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("Microsoft token error:", err);
        return NextResponse.json({ error: "Failed to get Microsoft token" }, { status: 400 });
      }

      const tokenData = await tokenRes.json();
      return NextResponse.json({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
      });
    }

    // ── Sync todos to Microsoft To Do ──
    if (action === "sync") {
      if (!accessToken || !todos) {
        return NextResponse.json({ error: "accessToken and todos required" }, { status: 400 });
      }

      // Get or create "Oforo Tasks" list
      const listsRes = await fetch("https://graph.microsoft.com/v1.0/me/todo/lists", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!listsRes.ok) {
        return NextResponse.json({ error: "Failed to fetch To Do lists" }, { status: 400 });
      }

      const listsData = await listsRes.json();
      let listId = listsData.value?.find((l: { displayName: string }) => l.displayName === "Oforo Tasks")?.id;

      if (!listId) {
        // Create the list
        const createRes = await fetch("https://graph.microsoft.com/v1.0/me/todo/lists", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ displayName: "Oforo Tasks" }),
        });
        if (createRes.ok) {
          const created = await createRes.json();
          listId = created.id;
        }
      }

      if (!listId) {
        return NextResponse.json({ error: "Could not create/find Oforo Tasks list" }, { status: 400 });
      }

      // Push each todo
      const results: { text: string; success: boolean }[] = [];
      for (const todo of todos) {
        const taskBody: Record<string, unknown> = {
          title: todo.text,
          importance: todo.priority === "high" ? "high" : todo.priority === "low" ? "low" : "normal",
          status: todo.completed ? "completed" : "notStarted",
        };

        if (todo.dueDate) {
          taskBody.dueDateTime = {
            dateTime: `${todo.dueDate}T${todo.dueTime || "09:00"}:00`,
            timeZone: "UTC",
          };
        }

        if (todo.dueDate) {
          taskBody.reminderDateTime = {
            dateTime: `${todo.dueDate}T${todo.dueTime || "08:00"}:00`,
            timeZone: "UTC",
          };
          taskBody.isReminderOn = true;
        }

        const taskRes = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskBody),
        });

        results.push({ text: todo.text, success: taskRes.ok });
      }

      return NextResponse.json({ synced: results.filter((r) => r.success).length, total: results.length, results });
    }

    // ── Fetch todos from Microsoft To Do ──
    if (action === "fetch") {
      if (!accessToken) {
        return NextResponse.json({ error: "accessToken required" }, { status: 400 });
      }

      const listsRes = await fetch("https://graph.microsoft.com/v1.0/me/todo/lists", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!listsRes.ok) {
        return NextResponse.json({ error: "Failed to fetch lists" }, { status: 400 });
      }

      const listsData = await listsRes.json();
      const oforoList = listsData.value?.find((l: { displayName: string }) => l.displayName === "Oforo Tasks");

      if (!oforoList) {
        return NextResponse.json({ todos: [] });
      }

      const tasksRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${oforoList.id}/tasks?$top=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!tasksRes.ok) {
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 400 });
      }

      const tasksData = await tasksRes.json();
      const tasks = tasksData.value?.map((t: {
        id: string;
        title: string;
        status: string;
        importance: string;
        dueDateTime?: { dateTime: string };
      }) => ({
        id: t.id,
        text: t.title,
        completed: t.status === "completed",
        priority: t.importance === "high" ? "high" : t.importance === "low" ? "low" : "medium",
        dueDate: t.dueDateTime?.dateTime?.split("T")[0],
      })) || [];

      return NextResponse.json({ todos: tasks });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Microsoft Todo API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
