import { NextRequest, NextResponse } from "next/server";

/**
 * Apple Reminders integration via CalDAV
 *
 * Apple uses CalDAV for Reminders sync. Users need to:
 * 1. Generate an App-Specific Password at appleid.apple.com
 * 2. Provide their Apple ID email + app-specific password
 *
 * Endpoints:
 *  POST /api/todo/apple
 *    action: "sync"    → pushes todos to Apple Reminders via CalDAV
 *    action: "test"    → tests CalDAV connection
 */

const CALDAV_BASE = "https://caldav.icloud.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, appleId, appPassword, todos } = body;

    if (!appleId || !appPassword) {
      return NextResponse.json({ error: "Apple ID and App-Specific Password required" }, { status: 400 });
    }

    const authHeader = "Basic " + btoa(`${appleId}:${appPassword}`);

    // ── Test connection ──
    if (action === "test") {
      try {
        const res = await fetch(`${CALDAV_BASE}/`, {
          method: "PROPFIND",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/xml; charset=utf-8",
            Depth: "0",
          },
          body: `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,
        });

        if (res.ok || res.status === 207) {
          return NextResponse.json({ connected: true, message: "Connected to iCloud" });
        } else {
          return NextResponse.json({ connected: false, message: "Authentication failed. Check your Apple ID and App-Specific Password." }, { status: 401 });
        }
      } catch {
        return NextResponse.json({ connected: false, message: "Could not reach iCloud CalDAV. Check network." }, { status: 500 });
      }
    }

    // ── Sync todos to Apple Reminders via CalDAV ──
    if (action === "sync") {
      if (!todos || !Array.isArray(todos)) {
        return NextResponse.json({ error: "todos array required" }, { status: 400 });
      }

      // Step 1: Find the user's principal URL
      const principalRes = await fetch(`${CALDAV_BASE}/`, {
        method: "PROPFIND",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/xml; charset=utf-8",
          Depth: "0",
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:current-user-principal />
  </d:prop>
</d:propfind>`,
      });

      if (!principalRes.ok && principalRes.status !== 207) {
        return NextResponse.json({ error: "CalDAV auth failed" }, { status: 401 });
      }

      const principalXml = await principalRes.text();
      // Extract principal URL from XML response
      const principalMatch = principalXml.match(/<d:href[^>]*>([^<]+)<\/d:href>/i);
      const principalUrl = principalMatch ? principalMatch[1] : null;

      if (!principalUrl) {
        // Fallback: try common iCloud CalDAV paths
        const fallbackUrl = `${CALDAV_BASE}/${encodeURIComponent(appleId)}/calendars/`;

        // Try to find a reminders calendar
        const calRes = await fetch(fallbackUrl, {
          method: "PROPFIND",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/xml; charset=utf-8",
            Depth: "1",
          },
          body: `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
  <d:prop>
    <d:displayname />
    <cs:getctag />
  </d:prop>
</d:propfind>`,
        });

        if (!calRes.ok && calRes.status !== 207) {
          // CalDAV direct sync not available — fall back to ICS generation
          return NextResponse.json({
            method: "ics-fallback",
            message: "Direct CalDAV sync not available. Use the ICS download to import into Apple Reminders.",
          });
        }
      }

      // Step 2: Create VTODO items and PUT them
      const results: { text: string; success: boolean }[] = [];

      for (const todo of todos) {
        const uid = `oforo-${todo.id}@oforo.com`;
        const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        let dtStart = now.slice(0, 8);
        if (todo.dueDate) {
          dtStart = todo.dueDate.replace(/-/g, "");
        }

        const vtodo = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Oforo//Tasks//EN",
          "BEGIN:VTODO",
          `UID:${uid}`,
          `DTSTAMP:${now}`,
          `SUMMARY:${todo.text}`,
          todo.dueDate
            ? todo.dueTime
              ? `DUE:${dtStart}T${todo.dueTime.replace(":", "")}00`
              : `DUE;VALUE=DATE:${dtStart}`
            : "",
          `PRIORITY:${todo.priority === "high" ? 1 : todo.priority === "medium" ? 5 : 9}`,
          `STATUS:${todo.completed ? "COMPLETED" : "NEEDS-ACTION"}`,
          todo.completed ? `COMPLETED:${now}` : "",
          `CATEGORIES:${todo.category || "Oforo"}`,
          "BEGIN:VALARM",
          "TRIGGER:-PT30M",
          "ACTION:DISPLAY",
          `DESCRIPTION:Task due: ${todo.text}`,
          "END:VALARM",
          "END:VTODO",
          "END:VCALENDAR",
        ]
          .filter(Boolean)
          .join("\r\n");

        try {
          // Try CalDAV PUT
          const calPath = principalUrl
            ? `${CALDAV_BASE}${principalUrl}calendars/tasks/${uid}.ics`
            : `${CALDAV_BASE}/${encodeURIComponent(appleId)}/calendars/tasks/${uid}.ics`;

          const putRes = await fetch(calPath, {
            method: "PUT",
            headers: {
              Authorization: authHeader,
              "Content-Type": "text/calendar; charset=utf-8",
              "If-None-Match": "*",
            },
            body: vtodo,
          });

          results.push({ text: todo.text, success: putRes.ok || putRes.status === 201 });
        } catch {
          results.push({ text: todo.text, success: false });
        }
      }

      const synced = results.filter((r) => r.success).length;

      if (synced === 0) {
        // All failed — suggest ICS fallback
        return NextResponse.json({
          method: "ics-fallback",
          synced: 0,
          total: results.length,
          message: "CalDAV sync failed for all tasks. Use the ICS download to import into Apple Reminders manually.",
        });
      }

      return NextResponse.json({ method: "caldav", synced, total: results.length, results });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Apple Todo API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
