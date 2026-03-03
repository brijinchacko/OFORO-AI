"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlan } from "@/components/PlanProvider";
import { OforoIcon, OforoLogo } from "@/components/OforoLogo";
import { FriendsBar, type Friend } from "@/components/FriendsPanel";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Sparkles,
  Zap,
  Search,
  GraduationCap,
  User,
  Plus,
  MessageSquare,
  Settings,
  X,
  LogOut,
  Languages,
  HelpCircle,
  Crown,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  MoreHorizontal,
  Mic,
  Users,
  Layout,
  Building2,
} from "lucide-react";
import type { Conversation, VoiceThread } from "@/types/chat";

/* ═══════ CONVERSATION CONTEXT MENU ═══════ */
export function ConvoContextMenu({ convo, onRename, onDelete, onTogglePin, onClose }: {
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
export function Sidebar({
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

        {/* Online friends — visible for logged-in users */}
        {user && friends.length > 0 && (
          <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: "1px solid var(--border-primary)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Online — {friends.filter((f) => f.status === "online").length}
              </span>
              <button onClick={onOpenFriends} className="text-[10px]" style={{ color: "var(--accent)" }}>All</button>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {friends.filter((f) => f.status === "online").slice(0, 8).map((friend) => (
                <button key={friend.id} onClick={() => onMessageFriend(friend)}
                  className="relative group" title={friend.name}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-transform hover:scale-110"
                    style={{ background: friend.avatarColor }}>
                    {friend.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border"
                    style={{ borderColor: "var(--bg-secondary)" }} />
                </button>
              ))}
              {friends.filter((f) => f.status === "online").length === 0 && (
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>No friends online</span>
              )}
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border-primary)" }}>
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
              <div className="space-y-1">
                {/* Products & Company for guests (mobile menu) */}
                <p className="px-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Products</p>
                <button onClick={() => router.push("/products/ladx")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Zap className="w-3.5 h-3.5 text-blue-500" /> LADX AI
                  <span className="ml-auto text-[10px]" style={{ color: "var(--text-tertiary)" }}>Automation</span>
                </button>
                <button onClick={() => router.push("/products/seekof")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Search className="w-3.5 h-3.5 text-purple-500" /> SEEKOF AI
                  <span className="ml-auto text-[10px]" style={{ color: "var(--text-tertiary)" }}>Discovery</span>
                </button>
                <button onClick={() => router.push("/products/nxted")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-500" /> NXTED AI
                  <span className="ml-auto text-[10px]" style={{ color: "var(--text-tertiary)" }}>Career</span>
                </button>
                <div className="my-1.5" style={{ borderTop: "1px solid var(--border-primary)" }} />
                <button onClick={() => router.push("/about")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Building2 className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} /> About Oforo
                </button>
                <button onClick={() => router.push("/pricing")} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-lg text-left transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Crown className="w-3.5 h-3.5 text-amber-500" /> Pricing
                </button>
                <div className="mt-2">
                  <button onClick={onSignIn}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                    style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}>
                    <User className="w-4 h-4" /> Sign in
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
