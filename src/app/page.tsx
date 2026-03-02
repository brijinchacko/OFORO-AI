"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { usePlan } from "@/components/PlanProvider";
import CanvasWhiteboard from "@/components/CanvasWhiteboard";
import TaskHub, { ScheduledQueryNotification, parseTodosFromAIResponse } from "@/components/TaskHub";
import VoiceChat from "@/components/VoiceChat";
import FriendsPanel, { FriendsBar, type Friend } from "@/components/FriendsPanel";
import DirectMessages from "@/components/DirectMessages";
import SharedWorkspace from "@/components/SharedWorkspace";
import NotificationCenter from "@/components/NotificationCenter";
import {
  Send,
  Paperclip,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Search,
  GraduationCap,
  Globe,
  Code,
  Check,
  Copy,
  User,
  Plus,
  MessageSquare,
  Settings,
  Menu,
  X,
  Brain,
  Factory,
  Lightbulb,
  TrendingUp,
  LogOut,
  ExternalLink,
  Languages,
  HelpCircle,
  Crown,
  LinkIcon,
  Image,
  Newspaper,
  FileText,
  ChevronUp,
  Upload,
  File,
  Monitor,
  Square,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  MoreHorizontal,
  CheckSquare,
  Mic,
  Users,
  Layout,
  Bell,
  Share2,
  PenTool,
  Lock,
  Building2,
} from "lucide-react";

/* ═══════ OFORO LOGO COMPONENTS ═══════ */
function OforoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img src="/OFORO_ICON.png" alt="Oforo" width={size} height={size}
      className={`${className} object-contain`} style={{ filter: "var(--logo-filter)" }} />
  );
}

function OforoLogo({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <img src={theme === "dark" ? "/OFORO_LOGO_LIGHT.png" : "/OFORO_LOGO_DARK.png"}
      alt="OFORO" height={22} className={`object-contain h-[22px] ${className}`} />
  );
}

/* ═══════ ANIMATED BACKGROUND ═══════ */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="hero-blur absolute" style={{ width: "500px", height: "500px", background: "var(--accent)", top: "-15%", left: "-10%", opacity: 0.06 }} />
      <div className="hero-blur absolute animate-float-slow" style={{ width: "400px", height: "400px", background: "#8b5cf6", top: "20%", right: "-5%", opacity: 0.04 }} />
      <div className="hero-blur absolute animate-float-slower" style={{ width: "350px", height: "350px", background: "#06b6d4", bottom: "10%", left: "30%", opacity: 0.04 }} />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(var(--border-primary) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: 0.3,
      }} />
    </div>
  );
}

/* ═══════ TYPES ═══════ */
interface Model {
  id: string; name: string; description: string;
  icon: React.ReactNode; color: string; badge?: string;
  productUrl?: string;
}

interface SearchResult { title: string; url: string; snippet: string; }

interface SearchImage { url: string; thumbnail: string; title: string; source: string; }

interface UploadedFile {
  fileName: string; fileType: string; content: string; base64?: string;
}

interface Message {
  id: string; role: "user" | "assistant"; content: string;
  model?: string; sources?: SearchResult[]; images?: SearchImage[];
  timestamp: Date; attachment?: UploadedFile;
}

interface Conversation {
  id: string; title: string; messages: Message[]; timestamp: Date;
  pinned?: boolean;
}

interface VoiceThread {
  id: string;
  title: string;
  messages: { id: string; role: "user" | "assistant"; text: string; timestamp: number }[];
  createdAt: number;
  updatedAt: number;
}

/* ═══════ PRODUCT SITE MAP ═══════ */
const productSites: Record<string, { name: string; url: string }> = {
  "ladx-agent": { name: "LADX AI", url: "/products/ladx" },
  "seekof-agent": { name: "SEEKOF AI", url: "/products/seekof" },
  "nxted-agent": { name: "NXTED AI", url: "/products/nxted" },
};

/* ═══════ MODELS ═══════ */
const models: Model[] = [
  { id: "oforo-general", name: "Oforo Mini", description: "Fast, lightweight AI for everyday tasks",
    icon: <Sparkles className="w-4 h-4" />, color: "text-blue-500", badge: "Default" },
  { id: "oforo-pro", name: "Oforo Pro", description: "Advanced reasoning & deep analysis",
    icon: <Brain className="w-4 h-4" />, color: "text-purple-500", badge: "Pro" },
  { id: "oforo-max", name: "Oforo MAX", description: "Collaborate with your Circle in real-time",
    icon: <Crown className="w-4 h-4" />, color: "text-amber-500", badge: "MAX" },
  { id: "ladx-agent", name: "LADX AI", description: "PLC programming & industrial automation",
    icon: <Zap className="w-4 h-4" />, color: "text-blue-500", productUrl: "/products/ladx" },
  { id: "seekof-agent", name: "SEEKOF AI", description: "AI tool discovery & comparison",
    icon: <Search className="w-4 h-4" />, color: "text-purple-500", productUrl: "/products/seekof" },
  { id: "nxted-agent", name: "NXTED AI", description: "Career guidance & skill assessment",
    icon: <GraduationCap className="w-4 h-4" />, color: "text-cyan-500", productUrl: "/products/nxted" },
];

/* ═══════ PRODUCT REDIRECT POPUP ═══════ */
function ProductPopup({ model, onDismiss, onVisit }: { model: Model; onDismiss: () => void; onVisit: () => void }) {
  return (
    <div className="animate-fade-in absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl p-4 z-50"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${model.color}`}>{model.icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Use the full {model.name} experience?</p>
          <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
            Visit the dedicated {model.name} site for specialised features, templates, and tools.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onVisit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}>
              Visit {model.name} <ExternalLink className="w-3 h-3" />
            </button>
            <button onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-primary)" }}>
              Stay here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════ MODEL SELECTOR ═══════ */
function ModelSelector({ selected, onSelect, onProductSelected }: {
  selected: string; onSelect: (id: string) => void;
  onProductSelected: (model: Model) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { canAccessModel, requiredPlanForModel, triggerUpgradePrompt } = usePlan();
  const currentModel = models.find((m) => m.id === selected)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        style={{ border: "1px solid var(--border-primary)" }}>
        <span className="font-medium">{currentModel.name}</span>
        {currentModel.badge && (
          <span className="px-1 py-0.5 text-[9px] font-bold rounded" style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>{currentModel.badge}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Select model</p>
            {models.map((model) => {
              const locked = !!user && !canAccessModel(model.id);
              const reqPlan = requiredPlanForModel(model.id);
              return (
                <button key={model.id}
                  onClick={() => {
                    if (locked) {
                      triggerUpgradePrompt(model.name, reqPlan);
                      setOpen(false);
                      return;
                    }
                    onSelect(model.id); setOpen(false);
                    if (model.productUrl) onProductSelected(model);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors"
                  style={{ background: selected === model.id ? "var(--bg-hover)" : "transparent", opacity: locked ? 0.6 : 1 }}>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{model.name}</span>
                      {model.badge && (
                        <span className="px-1 py-0.5 text-[9px] font-medium rounded" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>{model.badge}</span>
                      )}
                      {model.productUrl && (
                        <span className="px-1 py-0.5 text-[9px] font-medium rounded text-blue-400" style={{ background: "rgba(59,130,246,0.1)" }}>Product</span>
                      )}
                      {locked && (
                        <Lock className="w-3 h-3" style={{ color: reqPlan === "max" ? "#f59e0b" : "#a855f7" }} />
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{model.description}</p>
                  </div>
                  {selected === model.id && !locked && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ MARKDOWN-LITE RENDERER ═══════ */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = "";

  function inlineFmt(s: string) {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded text-xs" style="background: var(--bg-secondary)">$1</code>')
      .replace(/\[(\d+)\]/g, '<sup class="text-blue-400 text-[10px] font-bold cursor-pointer">[$1]</sup>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCodeBlock) { inCodeBlock = true; codeContent = ""; }
      else {
        elements.push(<pre key={i} className="my-2 p-3 rounded-lg text-xs overflow-x-auto" style={{ background: "var(--bg-secondary)" }}><code>{codeContent}</code></pre>);
        inCodeBlock = false; codeContent = "";
      }
      continue;
    }
    if (inCodeBlock) { codeContent += (codeContent ? "\n" : "") + line; continue; }

    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<div key={i} className="flex gap-2 ml-2"><span style={{ color: "var(--text-tertiary)" }}>•</span><span dangerouslySetInnerHTML={{ __html: inlineFmt(line.replace(/^[•\-\*]\s/, "")) }} /></div>);
    } else if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)![1];
      elements.push(<div key={i} className="flex gap-2 ml-2"><span style={{ color: "var(--text-tertiary)" }}>{num}.</span><span dangerouslySetInnerHTML={{ __html: inlineFmt(line.replace(/^\d+\.\s/, "")) }} /></div>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: inlineFmt(line) }} />);
    }
  }
  if (inCodeBlock && codeContent) {
    elements.push(<pre key="unclosed" className="my-2 p-3 rounded-lg text-xs overflow-x-auto" style={{ background: "var(--bg-secondary)" }}><code>{codeContent}</code></pre>);
  }
  return elements;
}

/* ═══════ TABBED SEARCH RESULTS (with Summary + Images) ═══════ */
function TabbedSourceCards({ sources, images, query }: { sources: SearchResult[]; images?: SearchImage[]; query?: string }) {
  const [activeTab, setActiveTab] = useState<"results" | "links" | "images" | "news">("results");
  const [expanded, setExpanded] = useState(false);

  const tabs = [
    { id: "results" as const, label: "Results", icon: <FileText className="w-3 h-3" /> },
    { id: "links" as const, label: "Links", icon: <LinkIcon className="w-3 h-3" /> },
    { id: "images" as const, label: "Images", icon: <Image className="w-3 h-3" />, count: images?.length },
    { id: "news" as const, label: "News", icon: <Newspaper className="w-3 h-3" /> },
  ];

  const shown = expanded ? sources : sources.slice(0, 4);
  const summary = sources.slice(0, 3).map((s) => s.snippet).join(" ").slice(0, 300);

  return (
    <div className="mb-3">
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

      {activeTab === "results" && (
        <div className="space-y-2">
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
          {shown.map((source, idx) => (
            <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer"
              className="block p-3 rounded-lg transition-colors"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                  style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>{idx + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--accent)" }}>{source.title}</p>
                  <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{source.url}</p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{source.snippet}</p>
                </div>
              </div>
            </a>
          ))}
          {sources.length > 4 && (
            <button onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--accent)" }}>
              {expanded ? "Show fewer" : `Show all ${sources.length} results`}
            </button>
          )}
        </div>
      )}

      {activeTab === "links" && (
        <div className="flex flex-wrap gap-2">
          {sources.map((source, idx) => (
            <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--accent)" }}>
              <Globe className="w-3 h-3" />
              <span className="max-w-[200px] truncate">{source.title}</span>
            </a>
          ))}
        </div>
      )}

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
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Loading images...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "news" && (
        <div className="space-y-2">
          {sources.filter((s) => s.snippet && s.snippet.length > 50).slice(0, 6).map((source, idx) => (
            <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer"
              className="block p-3 rounded-lg transition-colors"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{source.title}</p>
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

/* ═══════ MESSAGE COMPONENTS ═══════ */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded transition-colors" style={{ color: "var(--text-tertiary)" }}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MessageBubble({ message }: { message: Message }) {
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

function TypingIndicator() {
  return (
    <div className="message-enter flex items-center gap-1.5 py-2">
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--text-tertiary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--text-tertiary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--text-tertiary)" }} />
    </div>
  );
}

function SearchingIndicator() {
  return (
    <div className="message-enter flex items-center gap-2 py-3">
      <Search className="w-4 h-4 animate-pulse" style={{ color: "var(--accent)" }} />
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Searching the web...</span>
    </div>
  );
}

function StreamingMessage({ content, sources, images }: { content: string; sources: SearchResult[]; images?: SearchImage[] }) {
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

/* ═══════ CONVERSATION CONTEXT MENU ═══════ */
function ConvoContextMenu({ convo, onRename, onDelete, onTogglePin, onClose }: {
  convo: Conversation;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={menuRef} className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-2xl z-50 animate-fade-in py-1"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
      <button onClick={() => { onRename(convo.id); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <Pencil className="w-3.5 h-3.5" /> Rename
      </button>
      <button onClick={() => { onTogglePin(convo.id); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        {convo.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        {convo.pinned ? "Unpin" : "Pin to top"}
      </button>
      <div className="my-1" style={{ borderTop: "1px solid var(--border-primary)" }} />
      <button onClick={() => { onDelete(convo.id); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors text-red-400"
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}

/* ═══════ SIDEBAR ═══════ */
function Sidebar({
  conversations, activeConvo, onSelect, onNew,
  isOpen, onClose, collapsed, onToggleCollapse,
  user, authLoading, onLogout, onSignIn,
  onRenameConvo, onDeleteConvo, onTogglePinConvo,
  voiceThreads, onSelectVoiceThread, onDeleteVoiceThread, onRenameVoiceThread, onTogglePinVoiceThread,
  isMax, sidebarTab, onTabChange,
  friends, onOpenFriends, onMessageFriend, onOpenWorkspaces, onOpenMessages,
}: {
  conversations: Conversation[]; activeConvo: string | null;
  onSelect: (id: string) => void; onNew: () => void;
  isOpen: boolean; onClose: () => void;
  collapsed: boolean; onToggleCollapse: () => void;
  user: { id: string; email: string; name: string } | null;
  authLoading: boolean; onLogout: () => void; onSignIn: () => void;
  onRenameConvo: (id: string) => void;
  onDeleteConvo: (id: string) => void;
  onTogglePinConvo: (id: string) => void;
  voiceThreads: VoiceThread[];
  onSelectVoiceThread: (id: string) => void;
  onDeleteVoiceThread: (id: string) => void;
  onRenameVoiceThread: (id: string) => void;
  onTogglePinVoiceThread: (id: string) => void;
  isMax: boolean;
  sidebarTab: "chats" | "messages" | "workspaces";
  onTabChange: (tab: "chats" | "messages" | "workspaces") => void;
  friends: Friend[];
  onOpenFriends: () => void;
  onMessageFriend: (friend: Friend) => void;
  onOpenWorkspaces: () => void;
  onOpenMessages: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [productsSubOpen, setProductsSubOpen] = useState(false);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [voiceContextMenuId, setVoiceContextMenuId] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const router = useRouter();

  // Read language from localStorage
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian",
      pt: "Portuguese", nl: "Dutch", ru: "Russian", zh: "Chinese", ja: "Japanese",
      ko: "Korean", ar: "Arabic", hi: "Hindi", ml: "Malayalam", ta: "Tamil",
      tr: "Turkish", pl: "Polish", sv: "Swedish", da: "Danish", no: "Norwegian",
    };
    const saved = localStorage.getItem("oforo-language");
    if (saved && langMap[saved]) setCurrentLanguage(langMap[saved]);
  }, [profileOpen]);
  const { plan: currentPlan } = usePlan();

  // Sort: pinned first, then by timestamp
  const sortedConvos = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const pinnedConvos = sortedConvos.filter((c) => c.pinned);
  const unpinnedConvos = sortedConvos.filter((c) => !c.pinned);

  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col items-center py-3 w-16 flex-shrink-0 h-full"
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-primary)" }}>
        <Link href="/" className="mb-2 p-1 rounded-lg transition-colors hover:bg-opacity-50" style={{ color: "var(--text-secondary)" }}>
          <OforoIcon size={28} />
        </Link>
        {/* Collapse toggle — directly below logo */}
        <button onClick={onToggleCollapse} className="p-2 rounded-lg mb-2 transition-colors" style={{ color: "var(--text-tertiary)" }} title="Expand sidebar">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={onNew} className="p-2 rounded-lg mb-2 transition-colors" style={{ color: "var(--text-tertiary)" }} title="New chat">
          <Plus className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        {user ? (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer" title={user.name}
            onClick={onToggleCollapse}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <button onClick={onSignIn} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }} title="Sign in">
            <User className="w-5 h-5" />
          </button>
        )}
      </aside>
    );
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:relative z-50 lg:z-auto top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-primary)" }}>
        {/* Header with logo + collapse on right edge */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <Link href="/" className="transition-colors hover:opacity-75">
            <OforoLogo />
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={onToggleCollapse} className="hidden lg:block p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }} title="Collapse sidebar">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="lg:hidden p-1" style={{ color: "var(--text-tertiary)" }}><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-3">
          <button onClick={onNew} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg"
            style={{ border: "1px solid var(--border-primary)" }}>
            <Plus className="w-4 h-4" /> New chat
          </button>
        </div>

        {/* MAX sidebar tabs */}
        {isMax && (
          <div className="flex items-center gap-1 px-3 pb-2">
            {([
              { id: "chats" as const, label: "Chats", icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: "messages" as const, label: "Messages", icon: <Users className="w-3.5 h-3.5" /> },
              { id: "workspaces" as const, label: "Spaces", icon: <Layout className="w-3.5 h-3.5" /> },
            ]).map((tab) => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: sidebarTab === tab.id ? "var(--bg-hover)" : "transparent",
                  color: sidebarTab === tab.id ? "var(--text-primary)" : "var(--text-tertiary)",
                  border: sidebarTab === tab.id ? "1px solid var(--border-hover)" : "1px solid transparent",
                }}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {/* MAX: Messages tab */}
          {isMax && sidebarTab === "messages" && (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Direct Messages</p>
              {friends.filter((f) => f.status === "online").length > 0 ? (
                friends.filter((f) => f.status === "online").map((friend) => (
                  <button key={friend.id} onClick={() => onMessageFriend(friend)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div className="relative flex-shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: friend.avatarColor }}>{friend.avatar}</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                        style={{ borderColor: "var(--bg-secondary)", background: "#22c55e" }} />
                    </div>
                    <span className="truncate flex-1">{friend.name}</span>
                  </button>
                ))
              ) : null}
              {friends.filter((f) => f.status !== "online").map((friend) => (
                <button key={friend.id} onClick={() => onMessageFriend(friend)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold opacity-60"
                      style={{ background: friend.avatarColor }}>{friend.avatar}</div>
                  </div>
                  <span className="truncate flex-1 opacity-60">{friend.name}</span>
                </button>
              ))}
              {friends.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Your Circle is empty</p>
                  <button onClick={onOpenFriends} className="text-xs mt-1" style={{ color: "var(--accent)" }}>Add people</button>
                </div>
              )}
              <button onClick={onOpenMessages}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg mt-2"
                style={{ border: "1px solid var(--border-primary)", color: "var(--text-tertiary)" }}>
                Open Messages
              </button>
            </div>
          )}

          {/* MAX: Workspaces tab */}
          {isMax && sidebarTab === "workspaces" && (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Workspaces</p>
              <button onClick={onOpenWorkspaces}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg"
                style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                <Layout className="w-4 h-4" style={{ color: "var(--accent)" }} /> Open Workspaces
              </button>
              <p className="text-[11px] px-3 pt-1" style={{ color: "var(--text-tertiary)" }}>
                Create shared AI workspaces and collaborate with your Circle in real-time.
              </p>
            </div>
          )}

          {/* Chats tab (default — same as original) */}
          {(!isMax || sidebarTab === "chats") && (
            <>
          {/* Pinned conversations */}
          {pinnedConvos.length > 0 && (
            <>
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                <Pin className="w-3 h-3" /> Pinned
              </p>
              {pinnedConvos.map((c) => (
                <div key={c.id} className="relative group">
                  <button onClick={() => onSelect(c.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left"
                    style={{ background: activeConvo === c.id ? "var(--bg-hover)" : "transparent", color: activeConvo === c.id ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate flex-1">{c.title}</span>
                    <Pin className="w-3 h-3 flex-shrink-0 opacity-40" />
                  </button>
                  {/* Hover action button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setContextMenuId(contextMenuId === c.id ? null : c.id); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-tertiary)", background: "var(--bg-secondary)" }}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {contextMenuId === c.id && (
                    <ConvoContextMenu
                      convo={c}
                      onRename={onRenameConvo}
                      onDelete={onDeleteConvo}
                      onTogglePin={onTogglePinConvo}
                      onClose={() => setContextMenuId(null)}
                    />
                  )}
                </div>
              ))}
            </>
          )}
          {/* Recent conversations */}
          {unpinnedConvos.length > 0 && (
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Recent</p>
          )}
          {unpinnedConvos.map((c) => (
            <div key={c.id} className="relative group">
              <button onClick={() => onSelect(c.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left"
                style={{ background: activeConvo === c.id ? "var(--bg-hover)" : "transparent", color: activeConvo === c.id ? "var(--text-primary)" : "var(--text-secondary)" }}>
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate flex-1">{c.title}</span>
              </button>
              {/* Hover action button */}
              <button
                onClick={(e) => { e.stopPropagation(); setContextMenuId(contextMenuId === c.id ? null : c.id); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--text-tertiary)", background: "var(--bg-secondary)" }}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {contextMenuId === c.id && (
                <ConvoContextMenu
                  convo={c}
                  onRename={onRenameConvo}
                  onDelete={onDeleteConvo}
                  onTogglePin={onTogglePinConvo}
                  onClose={() => setContextMenuId(null)}
                />
              )}
            </div>
          ))}

          {/* Voice conversation threads */}
          {voiceThreads.length > 0 && (
            <>
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                <Mic className="w-3 h-3" /> Voice
              </p>
              {voiceThreads.map((vt) => (
                <div key={vt.id} className="relative group">
                  <button onClick={() => onSelectVoiceThread(vt.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    {(vt as any).pinned && <Pin className="w-3 h-3 flex-shrink-0 opacity-50" />}
                    <Mic className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                    <span className="truncate flex-1">{vt.title}</span>
                    <span className="text-[10px] flex-shrink-0 opacity-40">{vt.messages.length}</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setVoiceContextMenuId(voiceContextMenuId === vt.id ? null : vt.id); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-tertiary)", background: "var(--bg-secondary)" }}>
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  {voiceContextMenuId === vt.id && (
                    <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl py-1.5 shadow-xl animate-fade-in"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
                      <button onClick={() => { onRenameVoiceThread(vt.id); setVoiceContextMenuId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Pencil className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button onClick={() => { onTogglePinVoiceThread(vt.id); setVoiceContextMenuId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        {(vt as any).pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        {(vt as any).pinned ? "Unpin" : "Pin to top"}
                      </button>
                      <button onClick={() => { onDeleteVoiceThread(vt.id); setVoiceContextMenuId(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-red-400"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
          </>
          )}
        </div>

        {/* MAX: Friends bar above profile */}
        {isMax && friends.length > 0 && (
          <FriendsBar friends={friends} onOpenPanel={onOpenFriends} onMessageFriend={onMessageFriend} />
        )}

        <div style={{ borderTop: isMax && friends.length > 0 ? "none" : "1px solid var(--border-primary)" }}>
          {profileOpen && (
            <div className="px-3 pt-2 pb-1 space-y-0.5 animate-fade-in">
              <button onClick={() => router.push("/settings")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Settings className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} /> Settings
              </button>
              <button onClick={() => router.push("/language")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Languages className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} /> Language
                <span className="ml-auto text-xs" style={{ color: "var(--text-tertiary)" }}>{currentLanguage}</span>
              </button>
              <button onClick={() => router.push("/help")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <HelpCircle className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} /> Help & FAQ
              </button>
              {/* Products submenu */}
              <div>
                <button onClick={() => setProductsSubOpen(!productsSubOpen)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Sparkles className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} /> Products
                  <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${productsSubOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
                </button>
                {productsSubOpen && (
                  <div className="ml-6 mt-0.5 space-y-0.5 animate-fade-in">
                    <button onClick={() => router.push("/products/ladx")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <Zap className="w-3.5 h-3.5 text-blue-500" /> LADX AI
                    </button>
                    <button onClick={() => router.push("/products/seekof")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <Search className="w-3.5 h-3.5 text-purple-500" /> SEEKOF AI
                    </button>
                    <button onClick={() => router.push("/products/nxted")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-500" /> NXTED AI
                    </button>
                  </div>
                )}
              </div>
              {/* Company */}
              <button onClick={() => router.push("/about")} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Building2 className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} /> Company
              </button>
              <Link href="/pricing" className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Crown className="w-4 h-4 text-amber-500" /> Upgrade Plan
              </Link>
              {user && (
                <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-left transition-colors text-red-400"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              )}
            </div>
          )}
          <div className="p-3">
            {authLoading ? (
              <div className="h-10 rounded-lg animate-pulse" style={{ background: "var(--bg-hover)" }} />
            ) : user ? (
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors"
                style={{ background: profileOpen ? "var(--bg-hover)" : "transparent" }}
                onMouseEnter={(e) => { if (!profileOpen) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded"
                      style={{
                        background: currentPlan === "max" ? "rgba(245,158,11,0.15)" : currentPlan === "pro" ? "rgba(168,85,247,0.15)" : "var(--bg-hover)",
                        color: currentPlan === "max" ? "#f59e0b" : currentPlan === "pro" ? "#a855f7" : "var(--text-tertiary)",
                      }}>
                      {currentPlan === "max" ? "MAX" : currentPlan === "pro" ? "PRO" : "FREE"}
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{user.email}</p>
                </div>
                {profileOpen ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} /> : <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />}
              </button>
            ) : (
              <button onClick={onSignIn}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
                <User className="w-4 h-4" /> Sign in
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ═══════ FOCUS MODES ═══════ */
const focusModes = [
  { id: "all", label: "All", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "industrial", label: "Industrial", icon: <Factory className="w-3.5 h-3.5" /> },
  { id: "ai-tools", label: "AI Tools", icon: <Search className="w-3.5 h-3.5" /> },
  { id: "career", label: "Career", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: "code", label: "Code", icon: <Code className="w-3.5 h-3.5" /> },
];

const suggestions = [
  { icon: <Zap className="w-4 h-4 text-blue-500" />, text: "Generate a PLC program for a conveyor belt system", category: "LADX AI" },
  { icon: <Search className="w-4 h-4 text-purple-500" />, text: "Compare the top 5 AI image generation tools", category: "SEEKOF AI" },
  { icon: <GraduationCap className="w-4 h-4 text-cyan-500" />, text: "Create a learning path for data science", category: "NXTED AI" },
  { icon: <Lightbulb className="w-4 h-4 text-amber-500" />, text: "Explain how transformer models work", category: "General" },
];

function getModelForFocus(focusId: string): string {
  switch (focusId) {
    case "industrial": return "ladx-agent";
    case "ai-tools": return "seekof-agent";
    case "career": return "nxted-agent";
    case "code": return "oforo-pro";
    default: return "";
  }
}

/* ═══════════════════════════════
   MAIN PAGE
   ═══════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const { canAccessFeature, canAccessModel, triggerUpgradePrompt } = usePlan();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("oforo-general");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentSources, setCurrentSources] = useState<SearchResult[]>([]);
  const [currentImages, setCurrentImages] = useState<SearchImage[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [activeFocus, setActiveFocus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [productPopup, setProductPopup] = useState<Model | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([
    "What's new in AI this week",
    "Best open-source LLMs in 2026",
    "How to automate a packaging line",
    "Top skills employers want now",
  ]);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [taskHubOpen, setTaskHubOpen] = useState(false);
  const [mermaidCode, setMermaidCode] = useState<string | undefined>(undefined);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceThreads, setVoiceThreads] = useState<VoiceThread[]>([]);
  const [activeVoiceThreadId, setActiveVoiceThreadId] = useState<string | null>(null);
  const [scheduledNotification, setScheduledNotification] = useState<{
    id: string; prompt: string; schedule: { type: "daily"; time: string };
    enabled: boolean; lastRun: string; lastResult: string; nextRun: string;
    createdAt: string; webSearch: boolean; modelId: string;
  } | null>(null);

  // MAX features state
  const [friendsPanelOpen, setFriendsPanelOpen] = useState(false);
  const [directMessagesOpen, setDirectMessagesOpen] = useState(false);
  const [sharedWorkspaceOpen, setSharedWorkspaceOpen] = useState(false);
  const [dmActiveFriend, setDmActiveFriend] = useState<Friend | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "messages" | "workspaces">("chats");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const pauseRef = useRef(false);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inChat = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, streamingContent, isSearching]);

  // Load friends from localStorage for MAX features
  useEffect(() => {
    if (selectedModel !== "oforo-max") return;
    function loadFriends() {
      try {
        const saved = localStorage.getItem("oforo-friends");
        if (saved) setFriends(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    loadFriends();
    const interval = setInterval(loadFriends, 3000);
    return () => clearInterval(interval);
  }, [selectedModel]);

  // Reset sidebar tab when switching away from MAX
  useEffect(() => {
    if (selectedModel !== "oforo-max") setSidebarTab("chats");
  }, [selectedModel]);

  // Load voice threads from localStorage and poll for changes
  useEffect(() => {
    function loadVoiceThreads() {
      try {
        const saved = localStorage.getItem("oforo-voice-threads");
        if (saved) setVoiceThreads(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    loadVoiceThreads();
    // Poll every 2 seconds when voice chat is open to catch new threads
    const interval = setInterval(loadVoiceThreads, 2000);
    return () => clearInterval(interval);
  }, [voiceChatOpen]);

  // Fetch trending topics on mount and every 5 mins
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/trending");
        if (res.ok) {
          const data = await res.json();
          if (data.topics?.length) setTrendingTopics(data.topics);
        }
      } catch { /* use fallback */ }
    }
    fetchTrending();
    const interval = setInterval(fetchTrending, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (productPopup) {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      popupTimerRef.current = setTimeout(() => setProductPopup(null), 8000);
      return () => { if (popupTimerRef.current) clearTimeout(popupTimerRef.current); };
    }
  }, [productPopup]);

  useEffect(() => {
    if (inChat && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [messages, inChat]);

  /* ── File upload handler ── */
  async function handleFileUpload(file: globalThis.File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setUploadedFile({
          fileName: data.fileName,
          fileType: data.fileType,
          content: data.content,
          base64: data.base64,
        });
      }
    } catch {
      console.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  }

  /* ── Local file system access via File System Access API ── */
  async function handleBrowseFiles() {
    try {
      // Check if File System Access API is available
      if (!("showDirectoryPicker" in window)) {
        // Fallback: inject a message telling the user about browser support
        const fallbackMsg: Message = {
          id: Date.now().toString(), role: "assistant",
          content: "**File System Access** requires a Chromium-based browser (Chrome, Edge, Brave). Please open Oforo in Chrome or Edge to browse your local files.\n\nAlternatively, you can upload files using the 📎 paperclip button.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dirHandle = await (window as any).showDirectoryPicker({ mode: "read" });
      const fileList: string[] = [];

      const readDir = async (handle: FileSystemDirectoryHandle, path: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for await (const entry of (handle as any).values()) {
          if (entry.kind === "file") {
            fileList.push(`📄 ${path}${entry.name}`);
          } else if (entry.kind === "directory") {
            fileList.push(`📁 ${path}${entry.name}/`);
            if (fileList.length < 100) {
              await readDir(entry as FileSystemDirectoryHandle, `${path}${entry.name}/`);
            }
          }
          if (fileList.length >= 100) break;
        }
      }

      await readDir(dirHandle, "");

      const content = `I browsed the folder **"${dirHandle.name}"** on your computer and found:\n\n${fileList.slice(0, 50).join("\n")}\n${fileList.length > 50 ? `\n...and ${fileList.length - 50} more items` : ""}\n\nTotal: **${fileList.length}** items found. You can ask me to read or analyze any specific file.`;

      // Add as user action + assistant response
      const userMsg: Message = {
        id: Date.now().toString(), role: "user",
        content: `Browse my local folder: ${dirHandle.name}`,
        timestamp: new Date(),
      };
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content, timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Save handle for future file reading
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__oforoDirHandle = dirHandle;

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // User cancelled
      console.error("File system access error:", err);
    }
  }

  /* ── Conversation management ── */
  function handleRenameConvo(id: string) {
    const convo = conversations.find((c) => c.id === id);
    if (!convo) return;
    const newTitle = prompt("Rename conversation:", convo.title);
    if (newTitle && newTitle.trim()) {
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title: newTitle.trim() } : c));
    }
  }

  function handleDeleteConvo(id: string) {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvo === id) {
      setActiveConvo(null);
      setMessages([]);
    }
  }

  function handleTogglePinConvo(id: string) {
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
  }

  function handleFocusChange(focusId: string) {
    setActiveFocus(focusId);
    const mapped = getModelForFocus(focusId);
    if (mapped) setSelectedModel(mapped);
    else if (focusId === "all") setSelectedModel("oforo-general");
  }

  function handleModelSelect(id: string) { setSelectedModel(id); }
  function handleProductSelected(model: Model) { if (model.productUrl) setProductPopup(model); }

  /* ── Streaming controls ── */
  function handlePauseStream() {
    pauseRef.current = true;
    setIsPaused(true);
  }

  function handleResumeStream() {
    pauseRef.current = false;
    setIsPaused(false);
  }

  function handleStopStream() {
    pauseRef.current = false;
    setIsPaused(false);
    if (abortRef.current) abortRef.current.abort();
  }

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim();
    if (!content || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(), role: "user", content, timestamp: new Date(),
      attachment: uploadedFile || undefined,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");
    setCurrentSources([]);
    setCurrentImages([]);
    setIsPaused(false);
    pauseRef.current = false;
    const currentUpload = uploadedFile;
    setUploadedFile(null);
    if (inputRef.current) inputRef.current.style.height = "auto";
    if (chatInputRef.current) chatInputRef.current.style.height = "auto";

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let searchResults: SearchResult[] = [];
      let searchImages: SearchImage[] = [];
      let searchContext = "";

      if (webSearchEnabled) {
        setIsSearching(true);
        try {
          const [searchRes, imgRes] = await Promise.all([
            fetch("/api/search", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: content }), signal: controller.signal,
            }),
            fetch("/api/images", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: content }), signal: controller.signal,
            }).catch(() => null),
          ]);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            searchResults = searchData.results || [];
            setCurrentSources(searchResults);
            searchContext = searchData.context || "";
          }
          if (imgRes?.ok) {
            const imgData = await imgRes.json();
            searchImages = imgData.images || [];
            setCurrentImages(searchImages);
          }
        } catch { /* search failed */ }
        setIsSearching(false);
      }

      const apiMessages = updatedMessages.map((m) => {
        let msgContent = m.content;
        if (m.attachment && m === userMessage && currentUpload) {
          msgContent += `\n\n[Uploaded File: ${currentUpload.fileName}]\n${currentUpload.content}`;
        }
        return { role: m.role, content: msgContent };
      });

      const chatRes = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, modelId: selectedModel, searchContext, language: typeof window !== "undefined" ? localStorage.getItem("oforo-language") || "en" : "en" }),
        signal: controller.signal,
      });

      if (!chatRes.ok || !chatRes.body) throw new Error(`Chat request failed: ${chatRes.status}`);

      const reader = chatRes.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        // Pause support: wait while paused
        while (pauseRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

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
              if (token) { fullContent += token; setStreamingContent(fullContent); }
            } catch { /* ignore */ }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(), role: "assistant", content: fullContent,
        model: selectedModel,
        sources: searchResults.length > 0 ? searchResults : undefined,
        images: searchImages.length > 0 ? searchImages : undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Pro-only: Detect mermaid code blocks from AI response
      if (!user || canAccessFeature("canvas")) {
        const mermaidMatch = fullContent.match(/```mermaid\s*\n([\s\S]*?)```/);
        if (mermaidMatch) {
          setMermaidCode(mermaidMatch[1].trim());
          setCanvasOpen(true);
        }
      }

      // Always detect todos from AI response and add to localStorage
      if (true) { // Always detect tasks from AI responses
        const detectedTodos = parseTodosFromAIResponse(fullContent);
        if (detectedTodos.length > 0) {
          const existingRaw = localStorage.getItem("oforo-todos");
          const existing = existingRaw ? JSON.parse(existingRaw) : [];
          const newItems = detectedTodos.map((t) => ({
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            text: t.text,
            completed: false,
            dueDate: t.dueDate,
            priority: t.priority,
            category: "AI Suggested",
            createdAt: new Date().toISOString(),
          }));
          localStorage.setItem("oforo-todos", JSON.stringify([...newItems, ...existing]));
        }
      }

      if (!activeConvo) {
        const convoId = Date.now().toString();
        const title = content.length > 40 ? content.slice(0, 40) + "..." : content;
        setConversations((prev) => [{ id: convoId, title, messages: [...updatedMessages, assistantMessage], timestamp: new Date() }, ...prev]);
        setActiveConvo(convoId);
      } else {
        setConversations((prev) => prev.map((c) => c.id === activeConvo ? { ...c, messages: [...updatedMessages, assistantMessage] } : c));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // If stopped, save what we have so far
        if (streamingContent) {
          const partialMsg: Message = {
            id: (Date.now() + 1).toString(), role: "assistant",
            content: streamingContent + "\n\n*[Generation stopped]*",
            model: selectedModel, timestamp: new Date(),
            sources: currentSources.length > 0 ? currentSources : undefined,
            images: currentImages.length > 0 ? currentImages : undefined,
          };
          setMessages((prev) => [...prev, partialMsg]);
        }
        return;
      }
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please check your connection and try again.", model: selectedModel, timestamp: new Date() }]);
    } finally {
      setIsStreaming(false); setIsSearching(false); setStreamingContent(""); setCurrentSources([]); setCurrentImages([]);
      abortRef.current = null; readerRef.current = null;
      setIsPaused(false); pauseRef.current = false;
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  }, [input, isStreaming, messages, selectedModel, activeConvo, webSearchEnabled, uploadedFile, streamingContent, currentSources, currentImages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleNewChat() {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]); setActiveConvo(null); setSidebarOpen(false);
    setIsStreaming(false); setIsSearching(false); setStreamingContent(""); setCurrentSources([]); setCurrentImages([]);
    setUploadedFile(null); setIsPaused(false); pauseRef.current = false;
    setVoiceMode(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleSelectConvo(id: string) {
    const convo = conversations.find((c) => c.id === id);
    if (convo) { setMessages(convo.messages); setActiveConvo(id); }
    setSidebarOpen(false);
    setVoiceMode(false);
  }

  const firstName = user ? user.name.split(" ")[0] : "";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar
        conversations={conversations} activeConvo={activeConvo}
        onSelect={handleSelectConvo} onNew={handleNewChat}
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user} authLoading={authLoading}
        onLogout={logout} onSignIn={() => router.push("/auth")}
        onRenameConvo={handleRenameConvo}
        onDeleteConvo={handleDeleteConvo}
        onTogglePinConvo={handleTogglePinConvo}
        voiceThreads={voiceThreads}
        onSelectVoiceThread={(id) => { setActiveVoiceThreadId(id); setVoiceMode(true); setVoiceChatOpen(false); setSidebarOpen(false); }}
        onDeleteVoiceThread={(id) => {
          const updated = voiceThreads.filter((t) => t.id !== id);
          setVoiceThreads(updated);
          if (updated.length === 0) localStorage.removeItem("oforo-voice-threads");
          else localStorage.setItem("oforo-voice-threads", JSON.stringify(updated));
          if (activeVoiceThreadId === id) setActiveVoiceThreadId(null);
        }}
        onRenameVoiceThread={(id) => {
          const thread = voiceThreads.find((t) => t.id === id);
          if (!thread) return;
          const newTitle = prompt("Rename voice thread:", thread.title);
          if (newTitle && newTitle.trim()) {
            const updated = voiceThreads.map((t) => t.id === id ? { ...t, title: newTitle.trim() } : t);
            setVoiceThreads(updated);
            localStorage.setItem("oforo-voice-threads", JSON.stringify(updated));
          }
        }}
        onTogglePinVoiceThread={(id) => {
          const updated = voiceThreads.map((t) => t.id === id ? { ...t, pinned: !(t as any).pinned } : t);
          setVoiceThreads(updated);
          localStorage.setItem("oforo-voice-threads", JSON.stringify(updated));
        }}
        isMax={!user || canAccessFeature("circle")}
        sidebarTab={sidebarTab}
        onTabChange={setSidebarTab}
        friends={friends}
        onOpenFriends={() => { setFriendsPanelOpen(true); setSidebarOpen(false); }}
        onMessageFriend={(friend) => { setDmActiveFriend(friend); setDirectMessagesOpen(true); setSidebarOpen(false); }}
        onOpenWorkspaces={() => { setSharedWorkspaceOpen(true); setSidebarOpen(false); }}
        onOpenMessages={() => { setDirectMessagesOpen(true); setSidebarOpen(false); }}
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* ═══ TOP BAR ═══ */}
        <header className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <div className="flex items-center gap-3 relative">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5" style={{ color: "var(--text-tertiary)" }}><Menu className="w-5 h-5" /></button>
            <ModelSelector selected={selectedModel} onSelect={handleModelSelect} onProductSelected={handleProductSelected} />
            {productPopup && (
              <ProductPopup model={productPopup}
                onDismiss={() => setProductPopup(null)}
                onVisit={() => { router.push(productPopup.productUrl!); setProductPopup(null); }}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {!user && (
              <>
                <div className="hidden sm:flex items-center gap-1">
                  {[{ n: "LADX", h: "/products/ladx" }, { n: "SEEKOF", h: "/products/seekof" }, { n: "NXTED", h: "/products/nxted" }].map((p) => (
                    <Link key={p.n} href={p.h} className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors" style={{ color: "var(--text-tertiary)" }}>{p.n}</Link>
                  ))}
                </div>
                <Link href="/about" className="px-3 py-1.5 text-xs font-semibold tracking-wide rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
                  COMPANY
                </Link>
              </>
            )}
            {/* Pro & MAX features: Task Hub */}
            {(!user || canAccessFeature("taskhub")) && (
              <button onClick={() => setTaskHubOpen(true)} className="p-2 rounded-lg transition-colors relative" style={{ color: "var(--text-tertiary)" }}
                title="Tasks & Schedules">
                <CheckSquare className="w-5 h-5" />
                {(() => {
                  try {
                    const saved = typeof window !== "undefined" ? localStorage.getItem("oforo-todos") : null;
                    const todos = saved ? JSON.parse(saved) : [];
                    const active = todos.filter((t: { completed: boolean }) => !t.completed).length;
                    if (active > 0) return (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
                        style={{ background: "var(--accent)", color: "#fff" }}>{active > 9 ? "9+" : active}</span>
                    );
                  } catch { /* ignore */ }
                  return null;
                })()}
              </button>
            )}
            {/* MAX-only features */}
            {(!user || canAccessFeature("circle")) && (
              <>
                <button onClick={() => setFriendsPanelOpen(true)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                  title="My Circle">
                  <Users className="w-5 h-5" />
                </button>
                <button onClick={() => setSharedWorkspaceOpen(true)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                  title="Shared Workspaces">
                  <Layout className="w-5 h-5" />
                </button>
                <NotificationCenter />
              </>
            )}
          </div>
        </header>

        {/* ═══ CONTENT ═══ */}
        {voiceMode ? (
          <VoiceChat
            inline
            onClose={() => { setVoiceMode(false); setActiveVoiceThreadId(null); }}
            selectedModel={selectedModel}
            initialThreadId={activeVoiceThreadId}
            onSendMessage={async (text, modelId) => {
              const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [{ role: "user", content: text }],
                  modelId,
                  language: "en",
                }),
              });
              if (!res.ok) throw new Error("Failed to get response");
              const reader = res.body?.getReader();
              if (!reader) throw new Error("No reader");
              const decoder = new TextDecoder();
              let result = "";
              let buffer = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                    try {
                      const data = JSON.parse(trimmed.slice(6));
                      const token = data.content || data.choices?.[0]?.delta?.content;
                      if (token) result += token;
                    } catch { /* skip */ }
                  }
                }
              }
              return result;
            }}
          />
        ) : !inChat && !isStreaming ? (
          <div className="flex-1 flex flex-col items-center px-4 overflow-y-auto relative">
            <AnimatedBackground />
            <div className="w-full max-w-2xl mx-auto pt-[12vh] pb-8 relative z-10">
              <div className="flex flex-col items-center mb-10 animate-fade-in">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-center">
                  {user ? (
                    <>
                      <span style={{ color: "var(--text-tertiary)" }}>Hello, </span>
                      <span className="gradient-text">{firstName}</span>
                    </>
                  ) : (
                    <span>Where knowledge begins</span>
                  )}
                </h1>
                <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
                  {user ? "What would you like to explore today?" : "Ask anything. Our AI agents will search the web and find the answer."}
                </p>
              </div>

              <div className="animate-slide-up mb-8">
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
                    <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder="Ask anything... (try: 'browse my documents' or upload a file)" rows={1}
                      className="w-full bg-transparent resize-none focus:outline-none text-base"
                      style={{ color: "var(--text-primary)", minHeight: "28px", maxHeight: "120px" }}
                      onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: webSearchEnabled ? "rgba(59,130,246,0.15)" : "transparent",
                          color: webSearchEnabled ? "#3b82f6" : "var(--text-tertiary)",
                          border: webSearchEnabled ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                        }}
                        title={webSearchEnabled ? "Web search enabled" : "Web search disabled"}>
                        <Globe className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Web</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange}
                        accept=".txt,.csv,.json,.md,.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif,.webp" />
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                        title="Upload a file">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button onClick={() => sendMessage()} disabled={!input.trim() || isStreaming}
                        className="p-2 rounded-lg transition-all"
                        style={{
                          background: input.trim() && !isStreaming ? "var(--accent)" : "transparent",
                          color: input.trim() && !isStreaming ? "#fff" : "var(--text-tertiary)",
                        }}>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 animate-slide-up">
                {suggestions.map((s) => (
                  <button key={s.text} onClick={() => sendMessage(s.text)}
                    className="flex items-start gap-3 p-4 text-left rounded-xl transition-all hover:scale-[1.01]"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                    {s.icon}
                    <div>
                      <p className="text-sm">{s.text}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{s.category}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((t) => (
                    <button key={t} onClick={() => sendMessage(t)} className="px-3 py-1.5 text-xs rounded-full transition-colors hover:scale-[1.02]"
                      style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>{t}</button>
                  ))}
                </div>
              </div>

            </div>

            {/* ═══ FULL FOOTER — full width outside max-w-2xl ═══ */}
            <footer className="w-full mt-16 pt-8 pb-6 px-6 sm:px-12 relative z-10" style={{ borderTop: "1px solid var(--border-primary)" }}>
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
                  {/* Products */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Products</h4>
                    <div className="space-y-2">
                      {[
                        { n: "LADX AI", h: "/products/ladx" },
                        { n: "SEEKOF AI", h: "/products/seekof" },
                        { n: "NXTED AI", h: "/products/nxted" },
                        { n: "API Access", h: "/api-access" },
                      ].map((l) => (
                        <Link key={l.n} href={l.h} className="block text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>{l.n}</Link>
                      ))}
                    </div>
                  </div>
                  {/* Company */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Company</h4>
                    <div className="space-y-2">
                      {[
                        { n: "About", h: "/about" },
                        { n: "Blog", h: "/blog" },
                        { n: "Careers", h: "/careers" },
                        { n: "Contact", h: "/contact" },
                      ].map((l) => (
                        <Link key={l.n} href={l.h} className="block text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>{l.n}</Link>
                      ))}
                    </div>
                  </div>
                  {/* Resources */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Resources</h4>
                    <div className="space-y-2">
                      {[
                        { n: "Documentation", h: "/docs" },
                        { n: "API Reference", h: "/api-reference" },
                        { n: "Status", h: "/status" },
                        { n: "Changelog", h: "/changelog" },
                      ].map((l) => (
                        <Link key={l.n} href={l.h} className="block text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>{l.n}</Link>
                      ))}
                    </div>
                  </div>
                  {/* Legal */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Legal</h4>
                    <div className="space-y-2">
                      {[
                        { n: "Privacy", h: "/privacy" },
                        { n: "Terms", h: "/terms" },
                        { n: "Security", h: "/security" },
                      ].map((l) => (
                        <Link key={l.n} href={l.h} className="block text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>{l.n}</Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
                  <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>&copy; {new Date().getFullYear()} Oforo Ltd. All rights reserved.</p>
                  <a href="https://www.wartens.com" target="_blank" rel="noopener noreferrer" className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>A Wartens Company</a>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
                {isSearching && <SearchingIndicator />}
                {isStreaming && streamingContent && <StreamingMessage content={streamingContent} sources={currentSources} images={currentImages} />}
                {isStreaming && !streamingContent && !isSearching && <TypingIndicator />}
                {/* empty — streaming control moved into chatbox */}
                <div ref={messagesEndRef} />
              </div>
            </div>
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
                    <textarea ref={chatInputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder="Ask a follow-up..." rows={1} autoFocus
                      className="w-full bg-transparent resize-none focus:outline-none text-sm"
                      style={{ color: "var(--text-primary)", minHeight: "24px", maxHeight: "160px" }}
                      onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 160) + "px"; }}
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: webSearchEnabled ? "rgba(59,130,246,0.15)" : "transparent",
                          color: webSearchEnabled ? "#3b82f6" : "var(--text-tertiary)",
                          border: webSearchEnabled ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                        }}>
                        <Globe className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Web</span>
                      </button>
                      {/* Pro/MAX: Canvas whiteboard */}
                      {(!user || canAccessFeature("canvas")) && (
                        <button onClick={() => setCanvasOpen(true)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ color: "var(--text-tertiary)", border: "1px solid transparent" }}
                          title="Open Canvas">
                          <PenTool className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Canvas</span>
                        </button>
                      )}
                      {/* MAX: Share thread with Circle */}
                      {(!user || canAccessFeature("share_thread")) && activeConvo && (
                        <button onClick={() => setFriendsPanelOpen(true)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ color: "var(--text-tertiary)", border: "1px solid transparent" }}
                          title="Share with Circle">
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <input ref={chatFileInputRef} type="file" className="hidden" onChange={onFileChange}
                        accept=".txt,.csv,.json,.md,.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif,.webp" />
                      {(!user || canAccessFeature("browse_files")) && (
                        <button onClick={handleBrowseFiles} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                          title="Browse local files">
                          <Monitor className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => chatFileInputRef.current?.click()} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                        title="Upload a file">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      {/* Pro/MAX: Voice chat mic */}
                      {(!user || canAccessFeature("voice")) && !isStreaming && (
                        <button onClick={() => { setVoiceMode(true); setActiveVoiceThreadId(null); }} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                          title="Voice Chat">
                          <Mic className="w-4 h-4" />
                        </button>
                      )}
                      {isStreaming ? (
                        <button onClick={handleStopStream}
                          className="p-2 rounded-lg transition-all"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                          title="Stop generating">
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => sendMessage()} disabled={!input.trim()}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            background: input.trim() ? "var(--text-primary)" : "transparent",
                            color: input.trim() ? "#fff" : "var(--text-tertiary)",
                          }}>
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-center text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>Oforo AI can make mistakes. Consider verifying important information.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ CANVAS WHITEBOARD ═══ */}
      <CanvasWhiteboard
        isOpen={canvasOpen}
        onClose={() => { setCanvasOpen(false); setMermaidCode(undefined); }}
        mermaidCode={mermaidCode}
        onInsertToChat={(dataUrl) => {
          setCanvasOpen(false);
          setMermaidCode(undefined);
          sendMessage(`[Canvas drawing attached]\n![canvas](${dataUrl})`);
        }}
        onShare={(!user || canAccessFeature("circle")) ? () => {
          setCanvasOpen(false);
          setFriendsPanelOpen(true);
        } : undefined}
      />

      {/* ═══ TASK HUB (Tasks + Schedules) ═══ */}
      <TaskHub
        isOpen={taskHubOpen}
        onClose={() => setTaskHubOpen(false)}
        onRunQuery={async (prompt, modelId, webSearch) => {
          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                modelId,
                language: "en",
              }),
            });
            if (!res.ok) throw new Error("Failed");
            const reader = res.body?.getReader();
            if (!reader) throw new Error("No reader");
            const decoder = new TextDecoder();
            let result = "";
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                  try {
                    const data = JSON.parse(trimmed.slice(6));
                    const token = data.content || data.choices?.[0]?.delta?.content;
                    if (token) result += token;
                  } catch { /* skip */ }
                }
              }
            }
            setScheduledNotification({
              id: "notif-" + Date.now(), prompt, schedule: { type: "daily", time: "09:00" },
              enabled: true, lastRun: new Date().toISOString(), lastResult: result.slice(0, 300),
              nextRun: new Date().toISOString(), createdAt: new Date().toISOString(),
              webSearch, modelId,
            });
          } catch (err) {
            console.error("Scheduled query failed:", err);
          }
        }}
      />

      {/* ═══ SCHEDULED QUERY NOTIFICATION ═══ */}
      {scheduledNotification && (
        <ScheduledQueryNotification
          query={scheduledNotification}
          onDismiss={() => setScheduledNotification(null)}
          onView={() => {
            sendMessage(`Show me the full result for: ${scheduledNotification.prompt}`);
            setScheduledNotification(null);
          }}
        />
      )}

      {/* ═══ MAX: FRIENDS PANEL ═══ */}
      <FriendsPanel
        isOpen={friendsPanelOpen}
        onClose={() => setFriendsPanelOpen(false)}
        currentUser={user}
        onMessageFriend={(friend) => {
          setFriendsPanelOpen(false);
          setDmActiveFriend(friend);
          setDirectMessagesOpen(true);
        }}
        onShareThread={(friend) => {
          setFriendsPanelOpen(false);
          // Share active conversation as notification
          if (activeConvo) {
            const convo = conversations.find((c) => c.id === activeConvo);
            if (convo) {
              const notifications = JSON.parse(localStorage.getItem("oforo-notifications") || "[]");
              notifications.unshift({
                id: "notif-" + Date.now(), type: "shared_thread",
                title: "Thread Shared", message: `Shared "${convo.title}" with ${friend.name}`,
                timestamp: new Date().toISOString(), read: false,
              });
              localStorage.setItem("oforo-notifications", JSON.stringify(notifications));
            }
          }
        }}
        onShareCanvas={(friend) => {
          setFriendsPanelOpen(false);
          const notifications = JSON.parse(localStorage.getItem("oforo-notifications") || "[]");
          notifications.unshift({
            id: "notif-" + Date.now(), type: "shared_canvas",
            title: "Canvas Shared", message: `Shared canvas with ${friend.name}`,
            timestamp: new Date().toISOString(), read: false,
          });
          localStorage.setItem("oforo-notifications", JSON.stringify(notifications));
        }}
      />

      {/* ═══ MAX: DIRECT MESSAGES ═══ */}
      <DirectMessages
        isOpen={directMessagesOpen}
        onClose={() => { setDirectMessagesOpen(false); setDmActiveFriend(null); }}
        activeFriend={dmActiveFriend}
        currentUser={{
          id: user?.id || "self",
          name: user?.name || "You",
          avatar: user?.name?.charAt(0).toUpperCase() || "Y",
        }}
      />

      {/* ═══ MAX: SHARED WORKSPACES ═══ */}
      <SharedWorkspace
        isOpen={sharedWorkspaceOpen}
        onClose={() => setSharedWorkspaceOpen(false)}
        currentUser={{
          id: user?.id || "self",
          name: user?.name || "You",
          email: user?.email || "you@oforo.com",
          avatar: user?.name?.charAt(0).toUpperCase() || "Y",
          avatarColor: "#3b82f6",
        }}
        friends={friends}
        onSendAIMessage={async (text, modelId) => {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: text }],
              modelId: modelId || "oforo-max",
              language: "en",
            }),
          });
          if (!res.ok) throw new Error("Failed");
          const reader = res.body?.getReader();
          if (!reader) throw new Error("No reader");
          const decoder = new TextDecoder();
          let result = "";
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  const token = data.content || data.choices?.[0]?.delta?.content;
                  if (token) result += token;
                } catch { /* skip */ }
              }
            }
          }
          return result;
        }}
      />
    </div>
  );
}
