export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Web search using DuckDuckGo HTML endpoint (no API key needed).
 * Returns top results with title, URL, and snippet.
 */
export async function searchWeb(query: string, maxResults = 6): Promise<SearchResult[]> {
  try {
    const response = await fetch("https://html.duckduckgo.com/html/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: `q=${encodeURIComponent(query)}`,
    });

    if (!response.ok) return [];

    const html = await response.text();
    const results: SearchResult[] = [];

    // Extract result blocks
    // DuckDuckGo HTML uses class="result__a" for title links and class="result__snippet" for snippets
    const resultBlocks = html.split('class="result results_links');

    for (let i = 1; i < resultBlocks.length && results.length < maxResults; i++) {
      const block = resultBlocks[i];

      // Extract URL from result__a href
      const urlMatch = block.match(/class="result__a"\s+href="([^"]+)"/);
      // Extract title text
      const titleMatch = block.match(/class="result__a"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/a>/);
      // Extract snippet
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

      if (urlMatch && titleMatch) {
        // Clean the URL - DuckDuckGo wraps URLs in a redirect
        let url = urlMatch[1];
        const uddgMatch = url.match(/uddg=([^&]+)/);
        if (uddgMatch) {
          url = decodeURIComponent(uddgMatch[1]);
        }

        // Clean HTML from title and snippet
        const title = stripHtml(titleMatch[1]).trim();
        const snippet = snippetMatch ? stripHtml(snippetMatch[1]).trim() : "";

        if (title && url && url.startsWith("http")) {
          results.push({ title, url, snippet });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<b>/g, "")
    .replace(/<\/b>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formats search results into a context string for the LLM
 */
export function formatSearchContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  let context = "Here are relevant web search results to help answer the user's question:\n\n";
  results.forEach((r, i) => {
    context += `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.snippet}\n\n`;
  });
  context += "Use these sources to provide an accurate, up-to-date answer. Cite sources using [1], [2], etc. where relevant. If the search results aren't helpful, rely on your own knowledge but mention that.";

  return context;
}
