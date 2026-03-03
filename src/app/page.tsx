"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { usePlan } from "@/components/PlanProvider";
import { parseTodosFromAIResponse } from "@/components/TaskHub";
import { type Friend } from "@/components/FriendsPanel";
import {
  Menu,
  CheckSquare,
  Mic,
  PenTool,
  Users,
} from "lucide-react";
import type { SearchResult, SearchImage, UploadedFile, Message, Conversation, VoiceThread } from "@/types/chat";
import { getDefaultModelForTier, type OforoTier } from "@/lib/models";

/* ═══════ Extracted components ═══════ */
import { OforoIcon, OforoLogo } from "@/components/OforoLogo";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { Sidebar } from "@/components/chat/ChatSidebar";
import { MessageBubble, TypingIndicator, SearchingIndicator, StreamingMessage } from "@/components/chat/MessageBubble";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";

/* ═══════ Dynamic imports for heavy components ═══════ */
const CanvasWhiteboard = dynamic(() => import("@/components/CanvasWhiteboard"), { ssr: false });
const TaskHub = dynamic(() => import("@/components/TaskHub"), { ssr: false });
const VoiceChat = dynamic(() => import("@/components/VoiceChat"), { ssr: false });
const FriendsPanel = dynamic(() => import("@/components/FriendsPanel"), { ssr: false });
const DirectMessages = dynamic(() => import("@/components/DirectMessages"), { ssr: false });
const SharedWorkspace = dynamic(() => import("@/components/SharedWorkspace"), { ssr: false });
const NotificationCenter = dynamic(() => import("@/components/NotificationCenter"), { ssr: false });
const ScheduledQueryNotification = dynamic(
  () => import("@/components/TaskHub").then((mod) => ({ default: mod.ScheduledQueryNotification })),
  { ssr: false }
);

/* ═══════ FOCUS MODES ═══════ */
function getModelForFocus(focusId: string): string {
  switch (focusId) {
    case "code": return "claude-sonnet";
    default: return "";
  }
}

/* ═══════════════════════════════
   MAIN PAGE
   ═══════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { canAccessFeature, canAccessModel, triggerUpgradePrompt } = usePlan();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedTier, setSelectedTier] = useState<OforoTier>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("oforo-selected-tier") as OforoTier) || "mini";
    }
    return "mini";
  });
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("oforo-selected-model") || "gemini-flash";
    }
    return "gemini-flash";
  });
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
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("oforo-conversations");
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.map((c: Conversation) => ({
            ...c,
            timestamp: new Date(c.timestamp),
            messages: c.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })),
          }));
        }
      } catch { /* ignore */ }
    }
    return [];
  });
  // productPopup removed — products are now in top menu, not model selector
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
  const [taskToast, setTaskToast] = useState<string | null>(null);
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
  // popupTimerRef removed — products moved to top menu
  const streamingContentRef = useRef("");
  const inChat = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, streamingContent, isSearching]);

  // Persist conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem("oforo-conversations", JSON.stringify(conversations));
      } catch { /* storage full, ignore */ }
    }
  }, [conversations]);

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

  // productPopup effect removed — products moved to top menu

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
      if (!("showDirectoryPicker" in window)) {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__oforoDirHandle = dirHandle;

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
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
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try { localStorage.setItem("oforo-conversations", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
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
    const newModel = mapped || (focusId === "all" ? "gemini-flash" : null);
    if (newModel) {
      setSelectedModel(newModel);
      localStorage.setItem("oforo-selected-model", newModel);
    }
  }

  function handleTierSelect(tier: OforoTier) {
    setSelectedTier(tier);
    localStorage.setItem("oforo-selected-tier", tier);
    // Auto-select default model for the new tier
    const defaultModel = getDefaultModelForTier(tier);
    setSelectedModel(defaultModel);
    localStorage.setItem("oforo-selected-model", defaultModel);
  }
  function handleModelSelect(id: string) {
    setSelectedModel(id);
    localStorage.setItem("oforo-selected-model", id);
  }

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
    streamingContentRef.current = "";
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
              if (token) { fullContent += token; streamingContentRef.current = fullContent; setStreamingContent(fullContent); }
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
      if (true) {
        const detectedTodos = parseTodosFromAIResponse(fullContent);
        if (detectedTodos.length > 0) {
          const existingRaw = localStorage.getItem("oforo-todos");
          const existing = existingRaw ? JSON.parse(existingRaw) : [];
          const newItems = detectedTodos.map((t, i) => ({
            id: Date.now().toString() + i + Math.random().toString(36).slice(2, 6),
            text: t.text,
            completed: false,
            dueDate: t.dueDate,
            dueTime: t.dueTime,
            priority: t.priority,
            category: "AI Suggested",
            createdAt: new Date().toISOString(),
          }));
          localStorage.setItem("oforo-todos", JSON.stringify([...newItems, ...existing]));
          setTaskToast(`${detectedTodos.length} task${detectedTodos.length > 1 ? "s" : ""} added to Task Hub`);
          setTimeout(() => setTaskToast(null), 4000);
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
        const partialContent = streamingContentRef.current;
        if (partialContent) {
          const partialMsg: Message = {
            id: (Date.now() + 1).toString(), role: "assistant",
            content: partialContent,
            model: selectedModel, timestamp: new Date(),
          };
          setMessages((prev) => [...prev, partialMsg]);
        }
        return;
      }
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please check your connection and try again.", model: selectedModel, timestamp: new Date() }]);
    } finally {
      setIsStreaming(false); setIsSearching(false); setStreamingContent(""); streamingContentRef.current = "";
      setCurrentSources([]); setCurrentImages([]);
      abortRef.current = null; readerRef.current = null;
      setIsPaused(false); pauseRef.current = false;
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  }, [input, isStreaming, messages, selectedModel, activeConvo, webSearchEnabled, uploadedFile, streamingContent, currentSources, currentImages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleNewChat() {
    // If streaming, stop and save partial content before switching
    if (isStreaming && streamingContentRef.current && messages.length > 0) {
      if (abortRef.current) abortRef.current.abort();
      const partialMsg: Message = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: streamingContentRef.current,
        model: selectedModel, timestamp: new Date(),
      };
      const finalMessages = [...messages, partialMsg];
      if (activeConvo) {
        setConversations((prev) => prev.map((c) => c.id === activeConvo ? { ...c, messages: finalMessages } : c));
      } else {
        const convoId = Date.now().toString();
        const title = messages[0]?.content?.slice(0, 40) + (messages[0]?.content?.length > 40 ? "..." : "");
        setConversations((prev) => [{ id: convoId, title, messages: finalMessages, timestamp: new Date() }, ...prev]);
      }
    } else if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]); setActiveConvo(null); setSidebarOpen(false);
    setIsStreaming(false); setIsSearching(false); setStreamingContent(""); streamingContentRef.current = "";
    setCurrentSources([]); setCurrentImages([]);
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
          <div className="flex items-center gap-2 relative">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5" style={{ color: "var(--text-tertiary)" }}><Menu className="w-5 h-5" /></button>
            <ModelSelector selected={selectedTier} onSelect={handleTierSelect} />
          </div>
          <div className="flex items-center gap-1">
            {/* Mobile branding — full logo for guests, icon for logged-in */}
            <Link href="/" className="lg:hidden flex-shrink-0 mr-1">
              {user ? <OforoIcon size={22} /> : <OforoLogo />}
            </Link>
            {/* Feature buttons — visible for everyone, gated on click */}
            <button onClick={() => { if (!user) { router.push("/auth"); return; } setVoiceMode(true); setActiveVoiceThreadId(null); }}
              className="p-2 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs group relative"
              style={{ color: "var(--text-tertiary)" }}>
              <Mic className="w-3.5 h-3.5" />
              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-hover)" }}>
                Voice Mode — Talk to AI
              </span>
            </button>
            <button onClick={() => { if (!user) { router.push("/auth"); return; } setCanvasOpen(true); }}
              className="p-2 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs group relative"
              style={{ color: "var(--text-tertiary)" }}>
              <PenTool className="w-3.5 h-3.5" />
              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-hover)" }}>
                Canvas — Draw & Diagram
              </span>
            </button>
            <button onClick={() => { if (!user) { router.push("/auth"); return; } setTaskHubOpen(true); }}
              className="p-2 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs group relative"
              style={{ color: "var(--text-tertiary)" }}>
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-hover)" }}>
                Task Hub — Manage Todos
              </span>
            </button>
            <button onClick={() => { if (!user) { router.push("/auth"); return; } setFriendsPanelOpen(true); }}
              className="p-2 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs group relative"
              style={{ color: "var(--text-tertiary)" }}>
              <Users className="w-3.5 h-3.5" />
              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-hover)" }}>
                Friends — Connect & Chat
              </span>
            </button>
            {/* Product links for non-logged-in users */}
            {!user && (
              <>
                <div className="hidden sm:block w-px h-5 mx-1" style={{ background: "var(--border-primary)" }} />
                <Link href="/products/ladx" className="px-2 py-1.5 text-[11px] font-medium rounded-lg transition-colors hidden sm:block group relative"
                  style={{ color: "var(--text-tertiary)" }}>
                  LADX
                  <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-hover)" }}>
                    Industrial Automation AI
                  </span>
                </Link>
                <Link href="/products/seekof" className="px-2 py-1.5 text-[11px] font-medium rounded-lg transition-colors hidden sm:block group relative"
                  style={{ color: "var(--text-tertiary)" }}>
                  SEEKOF
                  <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-hover)" }}>
                    AI Tool Discovery
                  </span>
                </Link>
                <Link href="/products/nxted" className="px-2 py-1.5 text-[11px] font-medium rounded-lg transition-colors hidden sm:block group relative"
                  style={{ color: "var(--text-tertiary)" }}>
                  NXTED
                  <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-hover)" }}>
                    Career & Skill Guidance
                  </span>
                </Link>
                <Link href="/auth" className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hidden sm:block ml-1"
                  style={{ background: "var(--accent)", color: "white" }}>
                  Sign up
                </Link>
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
          <WelcomeScreen
            user={user}
            firstName={firstName}
            input={input}
            setInput={setInput}
            inputRef={inputRef}
            fileInputRef={fileInputRef}
            onKeyDown={handleKeyDown}
            onSend={sendMessage}
            onFileChange={onFileChange}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            isUploading={isUploading}
            isStreaming={isStreaming}
            webSearchEnabled={webSearchEnabled}
            setWebSearchEnabled={setWebSearchEnabled}
            trendingTopics={trendingTopics}
            selectedTier={selectedTier}
            selectedModel={selectedModel}
            onSelectModel={handleModelSelect}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
                {isSearching && <SearchingIndicator />}
                {isStreaming && streamingContent && <StreamingMessage content={streamingContent} sources={currentSources} images={currentImages} />}
                {isStreaming && !streamingContent && !isSearching && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <ChatInputBar
              input={input}
              setInput={setInput}
              onKeyDown={handleKeyDown}
              onSend={() => sendMessage()}
              chatInputRef={chatInputRef}
              chatFileInputRef={chatFileInputRef}
              onFileChange={onFileChange}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              isUploading={isUploading}
              isStreaming={isStreaming}
              webSearchEnabled={webSearchEnabled}
              setWebSearchEnabled={setWebSearchEnabled}
              canAccessCanvas={!user || canAccessFeature("canvas")}
              onOpenCanvas={() => setCanvasOpen(true)}
              canAccessShareThread={!user || canAccessFeature("share_thread")}
              activeConvo={activeConvo}
              onOpenFriendsPanel={() => setFriendsPanelOpen(true)}
              canAccessBrowseFiles={!user || canAccessFeature("browse_files")}
              onBrowseFiles={handleBrowseFiles}
              canAccessVoice={!user || canAccessFeature("voice")}
              onOpenVoiceMode={() => { setVoiceMode(true); setActiveVoiceThreadId(null); }}
              onStopStream={handleStopStream}
              selectedTier={selectedTier}
              selectedModel={selectedModel}
              onSelectModel={handleModelSelect}
            />
          </>
        )}
      </div>

      {/* ═══ TASK TOAST NOTIFICATION ═══ */}
      {taskToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <button onClick={() => { setTaskToast(null); setTaskHubOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all hover:scale-105"
            style={{ background: "var(--accent-primary)", color: "white" }}>
            <CheckSquare className="w-4 h-4" />
            {taskToast}
            <span className="text-xs opacity-75 ml-1">→ Open</span>
          </button>
        </div>
      )}

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
        friends={friends}
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
