import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    // Fetch trending topics from DuckDuckGo suggestions and news
    const topics: string[] = [];

    // Try DuckDuckGo news
    try {
      const queries = ["AI news today", "technology trending", "science breakthrough"];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];

      const res = await fetch(`https://html.duckduckgo.com/html/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `q=${encodeURIComponent(randomQuery)}&t=h_&ia=news`,
      });

      if (res.ok) {
        const html = await res.text();
        // Extract result titles
        const titleMatches = Array.from(html.matchAll(/<a[^>]*class="result__a"[^>]*>([^<]+)<\/a>/gi));
        for (const match of titleMatches) {
          const title = match[1].trim().replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
          if (title.length > 15 && title.length < 80 && topics.length < 8) {
            topics.push(title);
          }
        }
      }
    } catch {
      // Fallback if fetch fails
    }

    // If we got topics from the web, use them; otherwise use smart fallbacks
    if (topics.length < 4) {
      const now = new Date();
      const month = now.toLocaleString("en-US", { month: "long" });
      const year = now.getFullYear();

      const fallbacks = [
        `Latest AI developments ${month} ${year}`,
        `Top tech news this week`,
        `Breakthrough in renewable energy`,
        `Best programming languages ${year}`,
        `New space discoveries ${month}`,
        `Cybersecurity threats ${year}`,
        `Quantum computing advances`,
        `Electric vehicle market update`,
      ];

      // Shuffle and pick
      const shuffled = fallbacks.sort(() => Math.random() - 0.5);
      while (topics.length < 6) {
        topics.push(shuffled[topics.length]);
      }
    }

    return NextResponse.json({ topics: topics.slice(0, 6) });
  } catch (error) {
    console.error("Trending error:", error);
    return NextResponse.json({
      topics: [
        "What's new in AI this week",
        "Best open-source LLMs in 2026",
        "How to automate a packaging line",
        "Top skills employers want now",
        "Latest space exploration news",
        "Cybersecurity trends today",
      ],
    });
  }
}
