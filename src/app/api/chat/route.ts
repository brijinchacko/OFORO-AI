import { NextRequest, NextResponse } from "next/server";
import { getModelConfig } from "@/lib/models";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, modelId, searchContext, language } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
    }

    const config = getModelConfig(modelId || "oforo-general");

    // Build system prompt, optionally with search context and language
    let systemContent = config.systemPrompt;

    // Pro model: add task/todo awareness so AI creates actionable items
    if (modelId === "oforo-pro") {
      systemContent += `\n\nYou have a built-in task/todo tracking feature. When the user asks you to create tasks, reminders, or to-do items, format them clearly using this pattern so they are automatically detected:
- TODO: Task description
- TODO: Another task (include "by YYYY-MM-DD" for due dates, e.g. "TODO: Submit report by 2026-03-15")
You can also use "- [ ] Task" checkbox format. Use priority keywords like "urgent", "important", "high" for high priority or "low", "minor" for low priority. Tasks are automatically added to the user's task tracker.`;
    }
    if (language && language !== "en") {
      const langNames: Record<string, string> = {
        es: "Spanish", fr: "French", de: "German", it: "Italian", pt: "Portuguese",
        nl: "Dutch", ru: "Russian", zh: "Chinese", ja: "Japanese", ko: "Korean",
        ar: "Arabic", hi: "Hindi", ml: "Malayalam", ta: "Tamil", tr: "Turkish",
        pl: "Polish", sv: "Swedish", da: "Danish", no: "Norwegian",
      };
      const langName = langNames[language] || language;
      systemContent += `\n\nIMPORTANT: The user has selected ${langName} as their preferred language. You MUST respond entirely in ${langName}. Always reply in ${langName} regardless of the language the user types in.`;
    }
    if (searchContext) {
      systemContent += `\n\n--- WEB SEARCH RESULTS ---\n${searchContext}\n--- END SEARCH RESULTS ---\nUse these sources to provide an accurate, up-to-date answer. Cite sources using [1], [2], etc. where relevant.`;
    }

    const apiMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Oforo AI",
      },
      body: JSON.stringify({
        model: config.openrouterModel,
        messages: apiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI model" },
        { status: response.status }
      );
    }

    // Stream the response back
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
