import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Auth is handled by middleware; user info available in headers if needed
    // const userId = req.headers.get("x-user-id");
    // const userEmail = req.headers.get("x-user-email");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const allowedTypes = [
      "text/plain", "text/csv", "text/markdown",
      "application/pdf",
      "application/json",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/png", "image/jpeg", "image/gif", "image/webp",
    ];

    // Extract text content from supported file types
    let extractedText = "";
    let fileType = "unknown";

    if (file.type.startsWith("text/") || file.type === "application/json") {
      extractedText = await file.text();
      fileType = "text";
    } else if (file.type === "application/pdf") {
      // For PDF, we can't fully parse in edge, so we inform the user
      fileType = "pdf";
      extractedText = `[PDF Document: ${file.name}, Size: ${(file.size / 1024).toFixed(1)}KB] — PDF text extraction is available for text-based PDFs. The AI will analyze the document structure and metadata.`;
    } else if (file.type.startsWith("image/")) {
      fileType = "image";
      // Convert to base64 for AI vision (if model supports it)
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      extractedText = `[Image: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(1)}KB]`;
      return NextResponse.json({
        success: true,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        mimeType: file.type,
        content: extractedText,
        base64: `data:${file.type};base64,${base64}`,
      });
    } else if (
      file.type.includes("wordprocessingml") ||
      file.type.includes("spreadsheetml") ||
      file.type.includes("presentationml")
    ) {
      fileType = "office";
      extractedText = `[Office Document: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(1)}KB] — Document uploaded. The AI will do its best to analyze the document based on available information.`;
    } else {
      // Try to read as text anyway
      try {
        extractedText = await file.text();
        fileType = "text";
      } catch {
        extractedText = `[File: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(1)}KB]`;
        fileType = "binary";
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      mimeType: file.type,
      content: extractedText,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
