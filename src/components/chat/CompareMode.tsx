"use client";

import { useState, useRef, useCallback } from "react";
import { ArrowUp, X, Check, Copy, RotateCcw } from "lucide-react";
import { getModelsForTier, getModelConfig, type OforoTier } from "@/lib/models";
import { renderMarkdown } from "./MarkdownRenderer";

interface CompareColumn {
  modelId: string;
  modelName: string;
  content: string;
  isStreaming: boolean;
  error: string | null;
}

function ColumnCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded transition-colors" style={{ color: "var(--text-tertiary)" }}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function CompareMode({ tier, onClose }: {
  tier: OforoTier;
  onClose: () => void;
}) {
  const models = getModelsForTier(tier);
  const [selectedModels, setSelectedModels] = useState<string[]>(() => {
    const ids = models.map((m) => m.id);
    return ids.slice(0, 2);
  });
  const [prompt, setPrompt] = useState("");
  const [columns, setColumns] = useState<CompareColumn[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const abortRefs = useRef<AbortController[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const runComparison = useCallback(async () => {
    if (!prompt.trim() || selectedModels.length < 2) return;

    // Abort any previous requests
    abortRefs.current.forEach((c) => c.abort());
    abortRefs.current = [];

    const initial: CompareColumn[] = selectedModels.map((id) => ({
      modelId: id,
      modelName: getModelConfig(id).name,
      content: "",
      isStreaming: true,
      error: null,
    }));
    setColumns(initial);
    setHasRun(true);

    // Fire parallel requests
    selectedModels.forEach((modelId, idx) => {
      const controller = new AbortController();
      abortRefs.current.push(controller);

      (async () => {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: prompt }],
              modelId,
              language: typeof window !== "undefined" ? localStorage.getItem("oforo-language") || "en" : "en",
            }),
            signal: controller.signal,
          });

          if (!res.ok || !res.body) {
            setColumns((prev) => prev.map((c, i) => i === idx ? { ...c, isStreaming: false, error: `Error ${res.status}` } : c));
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullContent = "";
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  const token = parsed.choices?.[0]?.delta?.content || parsed.content;
                  if (token) {
                    fullContent += token;
                    setColumns((prev) => prev.map((c, i) => i === idx ? { ...c, content: fullContent } : c));
                  }
                } catch { /* ignore */ }
              }
            }
          }

          setColumns((prev) => prev.map((c, i) => i === idx ? { ...c, isStreaming: false } : c));
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") return;
          setColumns((prev) => prev.map((c, i) => i === idx ? { ...c, isStreaming: false, error: "Request failed" } : c));
        }
      })();
    });
  }, [prompt, selectedModels]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runComparison(); }
  };

  const handleReset = () => {
    abortRefs.current.forEach((c) => c.abort());
    abortRefs.current = [];
    setColumns([]);
    setHasRun(false);
    setPrompt("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const anyStreaming = columns.some((c) => c.isStreaming);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-primary)" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Compare Models</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
            Beta
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasRun && (
            <button onClick={handleReset} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }} title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => { abortRefs.current.forEach((c) => c.abort()); onClose(); }}
            className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model selector (before running) */}
      {!hasRun && (
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
            Select 2-3 models to compare (selected: {selectedModels.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {models.map((model) => {
              const isSelected = selectedModels.includes(model.id);
              const isDisabled = !isSelected && selectedModels.length >= 3;
              return (
                <button key={model.id}
                  onClick={() => !isDisabled && toggleModel(model.id)}
                  disabled={isDisabled}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: isSelected ? "rgba(168,85,247,0.15)" : "transparent",
                    color: isSelected ? "#a855f7" : isDisabled ? "var(--text-tertiary)" : "var(--text-secondary)",
                    border: isSelected ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--border-primary)",
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}>
                  {model.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results area */}
      {hasRun ? (
        <div className="flex-1 overflow-auto">
          {/* Prompt echo */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Prompt</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>{prompt}</p>
          </div>
          {/* Columns */}
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
            {columns.map((col, idx) => (
              <div key={col.modelId} className="flex flex-col min-h-0"
                style={{ borderRight: idx < columns.length - 1 ? "1px solid var(--border-primary)" : "none" }}>
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
                  style={{ borderBottom: "1px solid var(--border-primary)", background: "var(--bg-tertiary)" }}>
                  <span className="text-[11px] font-semibold" style={{ color: "#a855f7" }}>{col.modelName}</span>
                  <div className="flex items-center gap-1">
                    {col.isStreaming && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full animate-pulse"
                        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                        streaming
                      </span>
                    )}
                    {!col.isStreaming && col.content && <ColumnCopyButton text={col.content} />}
                  </div>
                </div>
                {/* Column content */}
                <div className="flex-1 overflow-y-auto px-3 py-3">
                  {col.error ? (
                    <p className="text-xs text-red-400">{col.error}</p>
                  ) : col.content ? (
                    <div className="chat-prose text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                      {renderMarkdown(col.content)}
                      {col.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 ml-0.5 animate-pulse" style={{ background: "var(--accent)" }} />
                      )}
                    </div>
                  ) : col.isStreaming ? (
                    <div className="flex items-center gap-1.5 py-2">
                      <div className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-tertiary)" }} />
                      <div className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-tertiary)" }} />
                      <div className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--text-tertiary)" }} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl focus-glow transition-all"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)" }}>
            <div className="px-4 pt-3 pb-1">
              <textarea ref={inputRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Enter a prompt to compare across models..."
                rows={1} autoFocus
                className="w-full bg-transparent resize-none focus:outline-none text-sm"
                style={{ color: "var(--text-primary)", minHeight: "24px", maxHeight: "120px" }}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
                disabled={anyStreaming}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                {hasRun && (
                  <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {columns.map((col) => (
                      <span key={col.modelId} className="px-1.5 py-0.5 rounded"
                        style={{ background: "var(--bg-tertiary)" }}>
                        {col.modelName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={runComparison} disabled={!prompt.trim() || selectedModels.length < 2 || anyStreaming}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: prompt.trim() && selectedModels.length >= 2 && !anyStreaming ? "var(--text-primary)" : "transparent",
                  color: prompt.trim() && selectedModels.length >= 2 && !anyStreaming ? "var(--bg-primary)" : "var(--text-tertiary)",
                }}>
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
            Compare how different AI models answer the same question
          </p>
        </div>
      </div>
    </div>
  );
}
