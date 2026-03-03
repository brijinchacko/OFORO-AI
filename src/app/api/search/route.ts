import { NextRequest, NextResponse } from "next/server";
import { searchWeb, formatSearchContext } from "@/lib/search";
import { searchSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Zod validation
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { query } = parsed.data;

    const results = await searchWeb(query, 8);
    const context = formatSearchContext(results);
    return NextResponse.json({ results, context });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ results: [], context: "" });
  }
}
