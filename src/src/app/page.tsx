"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import {
  Send,
  Paperclip,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
  Search,
  GraduationCap,
  Globe,
  Image,
  Code,
  Check,
  Copy,
  User,
  Sun,
  Moon,
  Plus,
  MessageSquare,
  Settings,
  Menu,
  X,
  Brain,
  Factory,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

/* ═══════ OFORO LOGO COMPONENTS ═══════ */
function OforoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        stroke="currentColor"
        strokeWidth="5.5"
        fill="none"
      />
    </svg>
  );
}

function OforoLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <OforoIcon size={28} />
      <span className="text-lg font-extrabold tracking-wide">OFORO</span>
    </div>
  );
}

/* ═══════ TYPES ═══════ */
interface Model {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

/* ═══════ MODELS ═══════ */
const models: Model[] = [
  {
    id: "oforo-general",
    name: "Oforo General",
    description: "Our most capable general-purpose model",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-blue-500",
    badge: "Default",
  },
  {
    id: "oforo-pro",
    name: "Oforo Pro",
    description: "Advanced reasoning & deep analysis",
    icon: <Brain className="w-4 h-4" />,
    color: "text-purple-500",
    badge: "Pro",
  },
  {
    id: "ladx-agent",
    name: "LADX AI",
    description: "PLC programming & industrial automation",
    icon: <Zap className="w-4 h-4" />,
    color: "text-blue-500",
  },
  {
    id: "seekof-agent",
    name: "SEEKOF AI",
    description: "AI tool discovery & comparison",
    icon: <Search className="w-4 h-4" />,
    color: "text-purple-500",
  },
  {
    id: "nxted-agent",
    name: "NXTED AI",
    description: "Career guidance & skill assessment",
    icon: <GraduationCap className="w-4 h-4" />,
    color: "text-cyan-500",
  },
];

/* ═══════ DEMO RESPONSES ═══════ */
const demoResponses: Record<string, string> = {
  "oforo-general":
    "Hello! I'm **Oforo AI**, your general-purpose assistant. I can help with research, writing, analysis, coding, and much more.\n\nI also have access to our specialised agents:\n\n• **LADX AI** — Industrial automation & PLC programming\n• **SEEKOF AI** — AI tool discovery & comparison\n• **NXTED AI** — Career development & skill assessment\n\nHow can I help you today?",
  "oforo-pro":
    "Hello! I'm **Oforo Pro** — our most advanced model with enhanced reasoning. I excel at complex analysis, multi-step problem solving, and detailed technical work. What would you like to explore?",
  "ladx-agent":
    "Hello! I'm the **LADX AI Agent**, specialised in PLC programming.\n\nI can generate Ladder Logic, Structured Text, and FBD code for Siemens, Allen-Bradley, Mitsubishi, and more — with built-in IEC 61131-3 safety compliance.\n\nDescribe your automation requirement and I'll generate production-ready code.",
  "seekof-agent":
    "Hello! I'm the **SEEKOF AI Agent**. I index over 50,000 AI tools worldwide.\n\nI can discover, compare, and recommend AI tools for any use case — with real-time pricing, reviews, and API access.\n\nWhat kind of AI tool are you looking for?",
  "nxted-agent":
    "Hello! I'm the **NXTED AI Agent**, your personal career coach.\n\nI can assess your skills, build personalised learning paths, and match you with employers.\n\nShall we start with a skill assessment, or do you have a specific career goal?",
};

/* ═══════ MODEL SELECTOR ═══════ */
function ModelSelector({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
        style={{ border: "1px solid var(--border-primary)" }}
      >
        <span className={currentModel.color}>{currentModel.icon}</span>
        <span className="font-medium">{currentModel.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}
        >
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Select model</p>
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => { onSelect(model.id); setOpen(false); }}
                className="w-full flex items-start gap-3 p-3 rounded-lg transition-colors"
                style={{ background: selected === model.id ? "var(--bg-hover)" : "transparent" }}
              >
                <div className={`mt-0.5 ${model.color}`}>{model.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{model.name}</span>
                    {model.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>{model.badge}</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{model.description}</p>
                </div>
                {selected === model.id && <Check className="w-4 h-4 text-blue-500 mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ MESSAGE BUBBLE ═══════ */
function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  return (
    <div className={`message-enter flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${isUser ? "bg-blue-600" : ""}`}
        style={!isUser ? { background: "var(--text-primary)", color: "var(--bg-primary)" } : {}}
      >
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <OforoIcon size={16} />}
      </div>
      <div className={`flex-1 max-w-3xl ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block text-left px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-blue-600 text-white rounded-tr-sm" : "rounded-tl-sm"}`}
          style={!isUser ? { background: "var(--bg-tertiary)" } : {}}
        >
          <div className="chat-prose whitespace-pre-wrap">{message.content}</div>
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5">
            <button
              onClick={() => { navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="p-1 transition-colors" style={{ color: "var(--text-tertiary)" }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ TYPING INDICATOR ═══════ */
function TypingIndicator() {
  return (
    <div className="flex gap-3 message-enter">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
        <OforoIcon size={16} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "var(--bg-tertiary)" }}>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--text-tertiary)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--text-tertiary)" }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--text-tertiary)" }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════ SIDEBAR ═══════ */
function Sidebar({ conversations, activeConvo, onSelect, onNew, isOpen, onClose }: {
  conversations: Conversation[];
  activeConvo: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:relative z-50 lg:z-auto top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <OforoLogo />
          <button onClick={onClose} className="lg:hidden p-1" style={{ color: "var(--text-tertiary)" }}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-3">
          <button onClick={onNew} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg" style={{ border: "1px solid var(--border-primary)" }}>
            <Plus className="w-4 h-4" /> New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Recent</p>
          {conversations.map((c) => (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left"
              style={{ background: activeConvo === c.id ? "var(--bg-hover)" : "transparent", color: activeConvo === c.id ? "var(--text-primary)" : "var(--text-secondary)" }}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{c.title}</span>
            </button>
          ))}
        </div>
        <div className="p-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg" style={{ color: "var(--text-tertiary)" }}><Settings className="w-4 h-4" /> Settings</button>
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

const trendingTopics = [
  "What's new in AI this week",
  "Best open-source LLMs in 2026",
  "How to automate a packaging line",
  "Top skills employers want now",
];

/* ═══════════════════════════════
   MAIN PAGE
   ═══════════════════════════════ */
export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("oforo-general");
  const [isTyping, setIsTyping] = useState(false);
  const [activeFocus, setActiveFocus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [conversations] = useState<Conversation[]>([
    { id: "1", title: "PLC traffic light system", timestamp: new Date(Date.now() - 3600000) },
    { id: "2", title: "Best AI writing tools", timestamp: new Date(Date.now() - 86400000) },
    { id: "3", title: "Data science career path", timestamp: new Date(Date.now() - 172800000) },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inChat = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(text?: string) {
    const content = text || input.trim();
    if (!content || isTyping) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content, timestamp: new Date() }]);
    setInput("");
    setIsTyping(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    setTimeout(() => {
      const response = messages.length === 0
        ? demoResponses[selectedModel]
        : `That's a great question about "${content.slice(0, 60)}${content.length > 60 ? "..." : ""}"\n\nAs Oforo AI, I'm processing your request using ${models.find((m) => m.id === selectedModel)?.name}. In production, this response would be streamed in real-time with rich formatting, citations, and interactive elements.`;
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response, model: selectedModel, timestamp: new Date() }]);
    }, 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleNewChat() {
    setMessages([]); setActiveConvo(null); setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar conversations={conversations} activeConvo={activeConvo}
        onSelect={(id) => { setActiveConvo(id); setSidebarOpen(false); }}
        onNew={handleNewChat} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* ═══ TOP BAR ═══ */}
        <header className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5" style={{ color: "var(--text-tertiary)" }}><Menu className="w-5 h-5" /></button>
            <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle — right side */}
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {[{ n: "LADX", h: "/products/ladx" }, { n: "SEEKOF", h: "/products/seekof" }, { n: "NXTED", h: "/products/nxted" }].map((p) => (
                <Link key={p.n} href={p.h} className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors" style={{ color: "var(--text-tertiary)" }}>{p.n}</Link>
              ))}
            </div>
            <Link href="/pricing" className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ color: "var(--text-tertiary)" }}>Pricing</Link>
            <button className="px-4 py-1.5 text-xs font-medium rounded-lg" style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>Sign in</button>
          </div>
        </header>

        {/* ═══ CONTENT ═══ */}
        {!inChat ? (
          /* ═══ WELCOME SCREEN (Perplexity-style) ═══ */
          <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto py-8">
              {/* Logo + tagline */}
              <div className="flex flex-col items-center mb-10 animate-fade-in">
                <OforoIcon size={56} className="mb-4" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-center">Where knowledge begins</h1>
                <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>Ask anything. Our AI agents will find the answer.</p>
              </div>

              {/* Search input */}
              <div className="animate-slide-up mb-8">
                <div className="rounded-2xl focus-glow transition-all" style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)" }}>
                  <div className="px-4 pt-4 pb-2">
                    <textarea
                      ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder="Ask anything..." rows={1}
                      className="w-full bg-transparent text-base resize-none focus:outline-none"
                      style={{ color: "var(--text-primary)", minHeight: "28px", maxHeight: "120px" }}
                      onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1">
                      {focusModes.map((m) => (
                        <button key={m.id} onClick={() => setActiveFocus(m.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: activeFocus === m.id ? "var(--bg-hover)" : "transparent",
                            color: activeFocus === m.id ? "var(--text-primary)" : "var(--text-tertiary)",
                            border: activeFocus === m.id ? "1px solid var(--border-hover)" : "1px solid transparent",
                          }}
                        >
                          {m.icon}<span className="hidden sm:inline">{m.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-lg" style={{ color: "var(--text-tertiary)" }}><Paperclip className="w-4 h-4" /></button>
                      <button onClick={() => handleSend()} disabled={!input.trim()}
                        className="p-2 rounded-lg transition-all"
                        style={{ background: input.trim() ? "var(--accent)" : "transparent", color: input.trim() ? "#fff" : "var(--text-tertiary)" }}
                      ><ArrowRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 animate-slide-up">
                {suggestions.map((s) => (
                  <button key={s.text} onClick={() => handleSend(s.text)}
                    className="flex items-start gap-3 p-4 text-left rounded-xl transition-all"
                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                  >
                    {s.icon}
                    <div>
                      <p className="text-sm">{s.text}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{s.category}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Trending */}
              <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((t) => (
                    <button key={t} onClick={() => handleSend(t)} className="px-3 py-1.5 text-xs rounded-full transition-colors"
                      style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-4 mt-12">
                {["Products", "Pricing", "About", "Docs"].map((l) => (
                  <Link key={l} href={`/${l.toLowerCase()}`} className="text-xs" style={{ color: "var(--text-tertiary)" }}>{l}</Link>
                ))}
              </div>
              <p className="text-center text-[11px] mt-3" style={{ color: "var(--text-tertiary)" }}>© {new Date().getFullYear()} Oforo Ltd · Milton Keynes, UK</p>
            </div>
          </div>
        ) : (
          /* ═══ CHAT VIEW ═══ */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="px-4 pb-4 pt-2 flex-shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="relative rounded-2xl focus-glow" style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)" }}>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="Ask a follow-up..." rows={1}
                    className="w-full bg-transparent px-4 py-3.5 pr-24 text-sm resize-none focus:outline-none"
                    style={{ color: "var(--text-primary)", minHeight: "48px", maxHeight: "160px" }}
                    onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 160) + "px"; }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button className="p-2" style={{ color: "var(--text-tertiary)" }}><Paperclip className="w-4 h-4" /></button>
                    <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
                      className="p-2 rounded-lg transition-all"
                      style={{ background: input.trim() && !isTyping ? "var(--text-primary)" : "transparent", color: input.trim() && !isTyping ? "var(--bg-primary)" : "var(--text-tertiary)" }}
                    ><Send className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-center text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>Oforo AI can make mistakes. Consider verifying important information.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
