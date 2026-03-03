"use client";

import { useState } from "react";
import {
  Sparkles,
  Globe,
  LinkIcon,
  Image,
  Newspaper,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { SearchResult, SearchImage } from "@/types/chat";

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

export function TabbedSourceCards({ sources, images }: { sources: SearchResult[]; images?: SearchImage[]; query?: string }) {
  const [activeTab, setActiveTab] = useState<"results" | "links" | "images" | "news">("results");

  const tabs = [
    { id: "results" as const, label: "Summary", icon: <FileText className="w-3 h-3" />, count: sources.length },
    { id: "links" as const, label: "Links", icon: <LinkIcon className="w-3 h-3" />, count: sources.length },
    { id: "images" as const, label: "Images", icon: <Image className="w-3 h-3" />, count: images?.length || 0 },
    { id: "news" as const, label: "News", icon: <Newspaper className="w-3 h-3" /> },
  ];

  const summary = sources.slice(0, 3).map((s) => s.snippet).join(" ").slice(0, 300);

  return (
    <div className="mb-3">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
            style={{
              background: activeTab === tab.id ? "var(--bg-hover)" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-tertiary)",
              border: activeTab === tab.id ? "1px solid var(--border-hover)" : "1px solid transparent",
            }}>
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count ? <span className="text-[9px] ml-0.5 opacity-60">{tab.count}</span> : null}
          </button>
        ))}
      </div>

      {/* ═══ SUMMARY TAB ═══ */}
      {activeTab === "results" && (
        <div className="space-y-2">
          {/* Quick summary */}
          {summary && (
            <div className="p-3 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Quick Summary</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {summary}{summary.length >= 300 ? "..." : ""}
              </p>
            </div>
          )}
          {/* Compact source chips */}
          <div className="flex flex-wrap gap-1.5">
            {sources.slice(0, 8).map((source, idx) => (
              <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>{idx + 1}</span>
                <span className="truncate max-w-[160px]">{getDomain(source.url)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ═══ LINKS TAB — detailed view ═══ */}
      {activeTab === "links" && (
        <div className="space-y-2">
          {sources.map((source, idx) => (
            <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer"
              className="block p-3 rounded-lg transition-colors hover:opacity-90"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--accent)" }}>{source.title}</p>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>{getDomain(source.url)}</p>
                  {source.snippet && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{source.snippet}</p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* ═══ IMAGES TAB ═══ */}
      {activeTab === "images" && (
        <div>
          {images && images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.slice(0, 9).map((img, idx) => (
                <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden group" style={{ border: "1px solid var(--border-primary)" }}>
                  <div className="aspect-video relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                    <img src={img.thumbnail} alt={img.title} loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="p-1.5">
                    <p className="text-[10px] truncate" style={{ color: "var(--text-secondary)" }}>{img.title}</p>
                    <p className="text-[9px] truncate" style={{ color: "var(--text-tertiary)" }}>{img.source}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-lg text-center" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <Image className="w-6 h-6 mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No images found for this query</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ NEWS TAB ═══ */}
      {activeTab === "news" && (
        <div className="space-y-2">
          {sources.filter((s) => s.snippet && s.snippet.length > 50).slice(0, 6).map((source, idx) => (
            <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer"
              className="block p-3 rounded-lg transition-colors hover:opacity-90"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{source.title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{getDomain(source.url)}</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{source.snippet}</p>
            </a>
          ))}
          {sources.filter((s) => s.snippet && s.snippet.length > 50).length === 0 && (
            <div className="p-4 rounded-lg text-center" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No news articles found for this query</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
