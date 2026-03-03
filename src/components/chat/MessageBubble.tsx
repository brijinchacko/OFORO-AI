"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  File,
  Search,
} from "lucide-react";
import type { Message, SearchResult, SearchImage } from "@/types/chat";
import { renderMarkdown } from "./MarkdownRenderer";
import { TabbedSourceCards } from "./TabbedSourceCards";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded transition-colors" style={{ color: "var(--text-tertiary)" }}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`message-enter ${isUser ? "flex justify-end" : ""}`}>
      <div className={isUser ? "max-w-[80%]" : "max-w-full"}>
        {isUser ? (
          <div>
            {message.attachment && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
                <File className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                <span style={{ color: "var(--text-secondary)" }}>{message.attachment.fileName}</span>
              </div>
            )}
            <div className="px-4 py-3 rounded-2xl text-sm" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              {message.content}
            </div>
          </div>
        ) : (
          <div>
            {message.sources && message.sources.length > 0 && <TabbedSourceCards sources={message.sources} images={message.images} />}
            <div className="chat-prose text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {renderMarkdown(message.content)}
            </div>
            <div className="mt-2"><CopyButton text={message.content} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="message-enter flex items-center gap-1.5 py-2">
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--text-tertiary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--text-tertiary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--text-tertiary)" }} />
    </div>
  );
}

export function SearchingIndicator() {
  return (
    <div className="message-enter flex items-center gap-2 py-3">
      <Search className="w-4 h-4 animate-pulse" style={{ color: "var(--accent)" }} />
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Searching the web...</span>
    </div>
  );
}

export function StreamingMessage({ content, sources, images }: { content: string; sources: SearchResult[]; images?: SearchImage[] }) {
  return (
    <div className="message-enter">
      {sources.length > 0 && <TabbedSourceCards sources={sources} images={images} />}
      <div className="chat-prose text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {renderMarkdown(content)}
        <span className="inline-block w-2 h-4 ml-0.5 animate-pulse" style={{ background: "var(--accent)" }} />
      </div>
    </div>
  );
}
