"use client";

import React from "react";
import Link from "next/link";
import {
  Paperclip,
  ArrowUp,
  Globe,
  X,
  Upload,
  File,
  Users,
} from "lucide-react";
import type { UploadedFile } from "@/types/chat";
import { ModelChips } from "@/components/chat/ModelChips";
import type { OforoTier } from "@/lib/models";

const suggestions = [
  "Explain how transformer models work",
  "Write a Python script to parse CSV files",
  "Compare React vs Next.js for new projects",
  "Help me plan a study schedule for data science",
];

export function WelcomeScreen({
  user,
  firstName,
  input,
  setInput,
  inputRef,
  fileInputRef,
  onKeyDown,
  onSend,
  onFileChange,
  uploadedFile,
  setUploadedFile,
  isUploading,
  isStreaming,
  webSearchEnabled,
  setWebSearchEnabled,
  trendingTopics,
  selectedTier,
  selectedModel,
  onSelectModel,
}: {
  user: { id: string; email: string; name: string } | null;
  firstName: string;
  input: string;
  setInput: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: (text?: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (v: UploadedFile | null) => void;
  isUploading: boolean;
  isStreaming: boolean;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (v: boolean) => void;
  trendingTopics: string[];
  selectedTier: OforoTier;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto pb-8">
        {/* Greeting */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 text-center">
            {user ? (
              <>Welcome back, {firstName}</>
            ) : (
              <>What can I help with?</>
            )}
          </h1>
        </div>

        {/* Input */}
        <div className="animate-slide-up mb-6">
          <div className="rounded-2xl focus-glow transition-all"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)" }}>
            {/* Uploaded file preview */}
            {uploadedFile && (
              <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
                <File className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                <span className="flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{uploadedFile.fileName}</span>
                <button onClick={() => setUploadedFile(null)} className="p-0.5"><X className="w-3 h-3" style={{ color: "var(--text-tertiary)" }} /></button>
              </div>
            )}
            {isUploading && (
              <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: "var(--bg-tertiary)" }}>
                <Upload className="w-3.5 h-3.5 animate-pulse" style={{ color: "var(--accent)" }} />
                <span style={{ color: "var(--text-tertiary)" }}>Uploading...</span>
              </div>
            )}
            <div className="px-4 pt-4 pb-2">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
                placeholder="Message Oforo..." rows={1}
                className="w-full bg-transparent resize-none focus:outline-none text-base"
                style={{ color: "var(--text-primary)", minHeight: "28px", maxHeight: "120px" }}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-0.5">
                <button onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: webSearchEnabled ? "rgba(59,130,246,0.15)" : "transparent",
                    color: webSearchEnabled ? "#3b82f6" : "var(--text-tertiary)",
                    border: webSearchEnabled ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                  }}
                  title={webSearchEnabled ? "Web search enabled" : "Enable web search"}>
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
                <ModelChips tier={selectedTier} selectedModel={selectedModel} onSelectModel={onSelectModel} />
              </div>
              <div className="flex items-center gap-1">
                <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange}
                  accept=".txt,.csv,.json,.md,.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif,.webp" />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                  title="Attach file">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button onClick={() => onSend()} disabled={!input.trim() || isStreaming}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: input.trim() && !isStreaming ? "var(--text-primary)" : "transparent",
                    color: input.trim() && !isStreaming ? "var(--bg-primary)" : "var(--text-tertiary)",
                    borderRadius: "8px",
                  }}>
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Simple suggestion chips */}
        <div className="flex flex-wrap justify-center gap-2 animate-slide-up">
          {suggestions.map((s) => (
            <button key={s} onClick={() => onSend(s)}
              className="px-3 py-1.5 text-xs rounded-full transition-colors"
              style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
              {s}
            </button>
          ))}
        </div>

        {/* Friends / Collaboration highlight */}
        <div className="mt-8 animate-fade-in">
          <Link href={user ? "#" : "/auth"}
            onClick={(e) => {
              if (user) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("openFriendsPanel"));
              }
            }}
            className="flex items-center gap-3 mx-auto max-w-sm px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
            style={{ border: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
            <div className="p-2 rounded-lg" style={{ background: "rgba(59,130,246,0.1)" }}>
              <Users className="w-4 h-4" style={{ color: "#3b82f6" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Chat with friends while using AI</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Add friends, message, and collaborate in real time</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
              New
            </span>
          </Link>
        </div>

        {/* Sign up prompt for non-logged-in users */}
        {!user && (
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              <Link href="/auth" className="font-medium transition-colors" style={{ color: "var(--accent)" }}>Sign up</Link>
              {" "}to save your conversations and unlock more features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
