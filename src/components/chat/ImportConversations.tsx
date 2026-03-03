"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import type { Conversation, Message } from "@/types/chat";

interface ChatGPTMessage {
  id: string;
  author: { role: string };
  content: { parts: string[] };
  create_time: number;
}

interface ChatGPTConversation {
  title: string;
  create_time: number;
  mapping: Record<string, { message?: ChatGPTMessage }>;
}

function parseChatGPTExport(data: ChatGPTConversation[]): Conversation[] {
  return data.map((conv) => {
    const messages: Message[] = [];
    const entries = Object.values(conv.mapping || {});
    // Sort by create_time
    const sorted = entries
      .filter((e) => e.message && e.message.author?.role && e.message.content?.parts?.length)
      .sort((a, b) => (a.message!.create_time || 0) - (b.message!.create_time || 0));

    for (const entry of sorted) {
      const msg = entry.message!;
      const role = msg.author.role;
      if (role !== "user" && role !== "assistant") continue;
      const content = msg.content.parts.join("\n").trim();
      if (!content) continue;
      messages.push({
        id: msg.id || Date.now().toString() + Math.random().toString(36).slice(2),
        role: role as "user" | "assistant",
        content,
        timestamp: new Date((msg.create_time || conv.create_time || Date.now() / 1000) * 1000),
      });
    }

    return {
      id: "import-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      title: conv.title || "Imported conversation",
      messages,
      timestamp: new Date((conv.create_time || Date.now() / 1000) * 1000),
    };
  }).filter((c) => c.messages.length > 0);
}

export function ImportConversations({ onImport, onClose }: {
  onImport: (conversations: Conversation[]) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [count, setCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus("parsing");
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      let conversations: Conversation[];
      if (Array.isArray(data)) {
        // ChatGPT format: array of conversations
        conversations = parseChatGPTExport(data);
      } else if (data.conversations && Array.isArray(data.conversations)) {
        // Wrapped format
        conversations = parseChatGPTExport(data.conversations);
      } else {
        throw new Error("Unrecognized format. Expected ChatGPT conversations.json export.");
      }

      if (conversations.length === 0) {
        throw new Error("No valid conversations found in the file.");
      }

      setCount(conversations.length);
      setStatus("success");
      onImport(conversations);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse file");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Import Conversations</h3>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          {status === "idle" && (
            <>
              <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                Import your conversations from ChatGPT. Go to ChatGPT Settings &rarr; Data Controls &rarr; Export data, then upload the <strong>conversations.json</strong> file here.
              </p>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }} />
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
                style={{ border: "2px dashed var(--border-hover)", color: "var(--text-secondary)" }}>
                <Upload className="w-4 h-4" />
                Choose conversations.json file
              </button>
              <p className="text-[10px] mt-3 text-center" style={{ color: "var(--text-tertiary)" }}>
                Your data stays on your device. Nothing is uploaded to our servers.
              </p>
            </>
          )}
          {status === "parsing" && (
            <div className="flex items-center justify-center gap-2 py-6">
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Importing conversations...</span>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {count} conversation{count !== 1 ? "s" : ""} imported
              </p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                You can find them in your chat history.
              </p>
              <button onClick={onClose} className="mt-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{ background: "var(--accent)", color: "white" }}>
                Done
              </button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Import failed</p>
              <p className="text-xs text-center" style={{ color: "var(--text-tertiary)" }}>{errorMsg}</p>
              <button onClick={() => { setStatus("idle"); setErrorMsg(""); }} className="mt-2 px-4 py-2 rounded-lg text-xs font-medium"
                style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
