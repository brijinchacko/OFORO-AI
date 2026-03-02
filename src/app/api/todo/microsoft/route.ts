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
const SCOPES = "Tasks.ReadWrite Mail.Send Mail.ReadWrite Calendars.ReadWrite offline_access";

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

    // ── Send email via Outlook ──
    if (action === "send-email") {
      if (!accessToken || !body.to || !body.subject || !body.content) {
        return NextResponse.json({ error: "accessToken, to, subject, and content required" }, { status: 400 });
      }

      const emailRes = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: body.subject,
            body: { contentType: "HTML", content: body.content },
            toRecipients: Array.isArray(body.to)
              ? body.to.map((email: string) => ({ emailAddress: { address: email } }))
              : [{ emailAddress: { address: body.to } }],
          },
        }),
      });

      if (!emailRes.ok) {
        const err = await emailRes.text();
        console.error("Outlook send error:", err);
        return NextResponse.json({ error: "Failed to send email" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Email sent via Outlook" });
    }

    // ── Fetch Outlook inbox ──
    if (action === "fetch-emails") {
      if (!accessToken) return NextResponse.json({ error: "accessToken required" }, { status: 400 });

      const mailRes = await fetch(
        "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=20&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,isRead,bodyPreview",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!mailRes.ok) return NextResponse.json({ error: "Failed to fetch emails" }, { status: 400 });

      const mailData = await mailRes.json();
      return NextResponse.json({
        emails: mailData.value?.map((m: { id: string; subject: string; from: { emailAddress: { name: string; address: string } }; receivedDateTime: string; isRead: boolean; bodyPreview: string }) => ({
          id: m.id,
          subject: m.subject,
          from: m.from?.emailAddress,
          receivedAt: m.receivedDateTime,
          isRead: m.isRead,
          preview: m.bodyPreview,
        })) || [],
      });
    }

    // ── Fetch calendar events (Teams & Outlook calendar) ──
    if (action === "fetch-calendar") {
      if (!accessToken) return NextResponse.json({ error: "accessToken required" }, { status: 400 });

      const now = new Date().toISOString();
      const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const calRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${now}&endDateTime=${weekLater}&$top=50&$orderby=start/dateTime&$select=id,subject,start,end,location,isOnlineMeeting,onlineMeeting,organizer`,
        { headers: { Authorization: `Bearer ${accessToken}`, Prefer: 'outlook.timezone="UTC"' } }
      );
      if (!calRes.ok) return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 400 });

      const calData = await calRes.json();
      return NextResponse.json({
        events: calData.value?.map((e: { id: string; subject: string; start: { dateTime: string }; end: { dateTime: string }; location: { displayName: string }; isOnlineMeeting: boolean; onlineMeeting: { joinUrl: string } | null; organizer: { emailAddress: { name: string } } }) => ({
          id: e.id,
          subject: e.subject,
          start: e.start?.dateTime,
          end: e.end?.dateTime,
          location: e.location?.displayName,
          isOnlineMeeting: e.isOnlineMeeting,
          joinUrl: e.onlineMeeting?.joinUrl,
          organizer: e.organizer?.emailAddress?.name,
        })) || [],
      });
    }

    // ── Create calendar event ──
    if (action === "create-event") {
      if (!accessToken || !body.subject || !body.start || !body.end) {
        return NextResponse.json({ error: "accessToken, subject, start, end required" }, { status: 400 });
      }

      const eventBody: Record<string, unknown> = {
        subject: body.subject,
        start: { dateTime: body.start, timeZone: "UTC" },
        end: { dateTime: body.end, timeZone: "UTC" },
        isOnlineMeeting: body.isTeamsMeeting || false,
        onlineMeetingProvider: body.isTeamsMeeting ? "teamsForBusiness" : undefined,
      };

      if (body.location) eventBody.location = { displayName: body.location };
      if (body.attendees) {
        eventBody.attendees = body.attendees.map((a: string) => ({
          emailAddress: { address: a },
          type: "required",
        }));
      }

      const eventRes = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(eventBody),
      });

      if (!eventRes.ok) {
        const err = await eventRes.text();
        console.error("Calendar event error:", err);
        return NextResponse.json({ error: "Failed to create event" }, { status: 400 });
      }

      const eventData = await eventRes.json();
      return NextResponse.json({ success: true, event: { id: eventData.id, subject: eventData.subject, joinUrl: eventData.onlineMeeting?.joinUrl } });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Microsoft API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
