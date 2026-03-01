import { NextRequest, NextResponse } from "next/server";
import { searchWeb } from "@/lib/search";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const results = await searchWeb(query, 6);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ results: [] });
  }
}
