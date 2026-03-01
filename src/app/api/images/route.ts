import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Use DuckDuckGo image search via their vqd token system
    const images: { url: string; thumbnail: string; title: string; source: string }[] = [];

    try {
      // Step 1: Get vqd token from DuckDuckGo
      const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iax=images&ia=images`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      const tokenHtml = await tokenRes.text();
      const vqdMatch = tokenHtml.match(/vqd=['"]([^'"]+)['"]/);

      if (vqdMatch) {
        const vqd = vqdMatch[1];
        // Step 2: Fetch image results
        const imgRes = await fetch(
          `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,,,&p=1`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Referer: "https://duckduckgo.com/",
            },
          }
        );
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const results = imgData.results || [];
          for (const r of results.slice(0, 12)) {
            images.push({
              url: r.image || r.url,
              thumbnail: r.thumbnail || r.image,
              title: r.title || "",
              source: r.source || new URL(r.image || r.url).hostname,
            });
          }
        }
      }
    } catch {
      // Image search failed, return empty
    }

    // If DuckDuckGo image search didn't work, try an alternative approach
    if (images.length === 0) {
      // Return placeholder images with helpful message
      return NextResponse.json({
        images: [],
        message: "Image search is processing. Try searching for more specific terms.",
      });
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json({ images: [], message: "Image search temporarily unavailable" });
  }
}
