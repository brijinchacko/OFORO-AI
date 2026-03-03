"use client";

import React from "react";
import {
  ArrowUp,
  Paperclip,
  Globe,
  X,
  Upload,
  File,
  Square,
} from "lucide-react";
import type { UploadedFile } from "@/types/chat";
import { ModelChips } from "@/components/chat/ModelChips";
import type { OforoTier } from "@/lib/models";

export function ChatInputBar({
  input,
  setInput,
  onKeyDown,
  onSend,
  chatInputRef,
  chatFileInputRef,
  onFileChange,
  uploadedFile,
  setUploadedFile,
  isUploading,
  isStreaming,
  webSearchEnabled,
  setWebSearchEnabled,
  canAccessCanvas,
  onOpenCanvas,
  canAccessShareThread,
  activeConvo,
  onOpenFriendsPanel,
  canAccessBrowseFiles,
  onBrowseFiles,
  canAccessVoice,
  onOpenVoiceMode,
  onStopStream,
  selectedTier,
  selectedModel,
  onSelectModel,
}: {
  input: string;
  setInput: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  chatInputRef: React.RefObject<HTMLTextAreaElement>;
  chatFileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (v: UploadedFile | null) => void;
  isUploading: boolean;
  isStreaming: boolean;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (v: boolean) => void;
  canAccessCanvas: boolean;
  onOpenCanvas: () => void;
  canAccessShareThread: boolean;
  activeConvo: string | null;
  onOpenFriendsPanel: () => void;
  canAccessBrowseFiles: boolean;
  onBrowseFiles: () => void;
  canAccessVoice: boolean;
  onOpenVoiceMode: () => void;
  onStopStream: () => void;
  selectedTier: OforoTier;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}) {
  return (
    <div className="px-4 pb-4 pt-2 flex-shrink-0" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl focus-glow transition-all"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)" }}>
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
          <div className="px-4 pt-3 pb-1">
            <textarea ref={chatInputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
              placeholder="Message Oforo..." rows={1} autoFocus
              className="w-full bg-transparent resize-none focus:outline-none text-sm"
              style={{ color: "var(--text-primary)", minHeight: "24px", maxHeight: "160px" }}
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 160) + "px"; }}
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
                }}>
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <ModelChips tier={selectedTier} selectedModel={selectedModel} onSelectModel={onSelectModel} />
            </div>
            <div className="flex items-center gap-1">
              <input ref={chatFileInputRef} type="file" className="hidden" onChange={onFileChange}
                accept=".txt,.csv,.json,.md,.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif,.webp" />
              <button onClick={() => chatFileInputRef.current?.click()} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                title="Attach file">
                <Paperclip className="w-4 h-4" />
              </button>
              {isStreaming ? (
                <button onClick={onStopStream}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                  title="Stop generating">
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={onSend} disabled={!input.trim()}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: input.trim() ? "var(--text-primary)" : "transparent",
                    color: input.trim() ? "var(--bg-primary)" : "var(--text-tertiary)",
                  }}>
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>Oforo AI can make mistakes. Consider verifying important information.</p>
      </div>
    </div>
  );
}
