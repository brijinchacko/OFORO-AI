"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users, UserPlus, Search, X, Check, XCircle, MessageSquare,
  Share2, MoreHorizontal, Trash2, Loader2, Send,
} from "lucide-react";

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  status: "online" | "offline";
  addedAt: string;
}

export interface FriendRequest {
  id: string;
  from: { id: string; name: string; email: string; avatar: string };
  timestamp: string;
  status: "pending" | "accepted" | "declined";
}

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageFriend: (friend: Friend) => void;
  onShareThread: (friend: Friend) => void;
  onShareCanvas: (friend: Friend) => void;
  currentUser: { id: string; name: string; email: string } | null;
}

const AVATAR_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#6366f1", "#d946ef",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function FriendsPanel({
  isOpen, onClose, onMessageFriend, onShareThread, onShareCanvas, currentUser,
}: FriendsPanelProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string; avatar: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "add">("friends");
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [searching, setSearching] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchFriends = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch("/api/friends?action=list"),
        fetch("/api/friends?action=requests"),
      ]);
      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends((data.friends || []).map((f: { id: string; name: string; email: string; avatar: string; addedAt: string }) => ({
          ...f, avatarColor: getAvatarColor(f.id), status: "offline" as const,
        })));
      }
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.requests || []);
      }
    } catch { /* ignore */ }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) fetchFriends();
  }, [isOpen, fetchFriends]);

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/friends?action=search&q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch { /* ignore */ }
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (addEmail.length >= 2) searchUsers(addEmail); else setSearchResults([]); }, 300);
    return () => clearTimeout(timer);
  }, [addEmail, searchUsers]);

  async function handleSendRequest(emailOrId: string, isId = false) {
    setLoadingAction(true);
    setAddError(null);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-request", ...(isId ? { friendId: emailOrId } : { email: emailOrId }) }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error); }
      else {
        setAddSuccess(data.message || "Request sent!");
        setAddEmail("");
        setSearchResults([]);
        setTimeout(() => setAddSuccess(null), 3000);
        fetchFriends();
      }
    } catch { setAddError("Network error"); }
    setLoadingAction(false);
  }

  async function handleRequest(friendId: string, action: "accept" | "decline") {
    try {
      await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, friendId }),
      });
      fetchFriends();
    } catch { /* ignore */ }
  }

  async function handleRemoveFriend(friendId: string) {
    try {
      await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", friendId }),
      });
      setContextMenuId(null);
      fetchFriends();
    } catch { /* ignore */ }
  }

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ width: "360px", maxHeight: "520px" }}>
      <div ref={panelRef}
        className="w-full rounded-2xl shadow-2xl flex flex-col animate-fade-in"
        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-hover)", maxHeight: "520px" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-semibold">My Circle</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3">
          {([
            { id: "friends" as const, label: "Friends", count: friends.length },
            { id: "requests" as const, label: "Requests", count: requests.length },
            { id: "add" as const, label: "Add People", count: 0 },
          ]).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.id ? "var(--bg-hover)" : "transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-tertiary)",
                border: activeTab === tab.id ? "1px solid var(--border-hover)" : "1px solid transparent",
              }}>
              {tab.label}
              {tab.count > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                  style={{ background: tab.id === "requests" ? "rgba(239,68,68,0.15)" : "var(--bg-secondary)", color: tab.id === "requests" ? "#ef4444" : "var(--text-tertiary)" }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "friends" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-transparent"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
              </div>

              {filteredFriends.length > 0 ? filteredFriends.map((friend) => (
                <FriendItem key={friend.id} friend={friend}
                  showContextMenu={contextMenuId === friend.id}
                  onToggleMenu={() => setContextMenuId(contextMenuId === friend.id ? null : friend.id)}
                  onMessage={() => onMessageFriend(friend)}
                  onShareThread={() => onShareThread(friend)}
                  onShareCanvas={() => onShareCanvas(friend)}
                  onRemove={() => handleRemoveFriend(friend.id)} />
              )) : (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    {searchQuery ? "No one found" : "Add people to your Circle"}
                  </p>
                  <button onClick={() => setActiveTab("add")}
                    className="mt-2 px-4 py-1.5 text-xs font-medium rounded-lg"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    <UserPlus className="w-3 h-3 inline mr-1" /> Add People
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No pending requests</p>
                </div>
              ) : requests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: getAvatarColor(req.from.id) }}>{req.from.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.from.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{req.from.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleRequest(req.from.id, "accept")} className="p-1.5 rounded-lg" style={{ color: "#22c55e" }}><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleRequest(req.from.id, "decline")} className="p-1.5 rounded-lg" style={{ color: "#ef4444" }}><XCircle className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "add" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Find people by name or email</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input type="text" value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full px-3 py-2 rounded-lg text-sm bg-transparent"
                      style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                      onKeyDown={(e) => { if (e.key === "Enter" && addEmail.includes("@")) handleSendRequest(addEmail); }} />
                    {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin" style={{ color: "var(--text-tertiary)" }} />}
                  </div>
                  {addEmail.includes("@") && (
                    <button onClick={() => handleSendRequest(addEmail)} disabled={loadingAction}
                      className="px-3 py-2 rounded-lg text-sm font-medium"
                      style={{ background: "var(--accent)", color: "#fff" }}>
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {addSuccess && <p className="text-xs mt-2 text-green-500">{addSuccess}</p>}
                {addError && <p className="text-xs mt-2 text-red-400">{addError}</p>}
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Results</p>
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: getAvatarColor(user.id) }}>{user.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{user.email}</p>
                      </div>
                      <button onClick={() => handleSendRequest(user.id, true)} disabled={loadingAction}
                        className="px-3 py-1 text-xs font-medium rounded-lg"
                        style={{ background: "var(--accent)", color: "#fff" }}>
                        {loadingAction ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addEmail.length >= 2 && searchResults.length === 0 && !searching && (
                <p className="text-xs text-center py-4" style={{ color: "var(--text-tertiary)" }}>
                  {addEmail.includes("@") ? "Send a request by pressing Enter" : "No users found"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FriendItem({ friend, showContextMenu, onToggleMenu, onMessage, onShareThread, onShareCanvas, onRemove }: {
  friend: Friend; showContextMenu: boolean; onToggleMenu: () => void;
  onMessage: () => void; onShareThread: () => void; onShareCanvas: () => void; onRemove: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showContextMenu) return;
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onToggleMenu(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showContextMenu, onToggleMenu]);

  return (
    <div className="relative flex items-center gap-3 p-2 rounded-lg transition-colors group"
      style={{ background: "var(--bg-secondary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ background: friend.avatarColor }}>{friend.avatar}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{friend.name}</p>
        <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{friend.email}</p>
      </div>
      <div className="flex items-center gap-0.5">
        <button onClick={onMessage} className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: "var(--text-tertiary)" }} title="Message"><MessageSquare className="w-4 h-4" /></button>
        <button onClick={onToggleMenu} className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: "var(--text-tertiary)" }} title="More"><MoreHorizontal className="w-4 h-4" /></button>
      </div>

      {showContextMenu && (
        <div ref={menuRef} className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-2xl z-50 py-1 animate-fade-in"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
          <button onClick={() => { onMessage(); onToggleMenu(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left" style={{ color: "var(--text-secondary)" }}>
            <MessageSquare className="w-3.5 h-3.5" /> Message</button>
          <button onClick={() => { onShareThread(); onToggleMenu(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left" style={{ color: "var(--text-secondary)" }}>
            <Share2 className="w-3.5 h-3.5" /> Share Chat</button>
          <div className="my-1" style={{ borderTop: "1px solid var(--border-primary)" }} />
          <button onClick={onRemove}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-red-400">
            <Trash2 className="w-3.5 h-3.5" /> Remove</button>
        </div>
      )}
    </div>
  );
}

export function FriendsBar({ friends, onOpenPanel, onMessageFriend }: {
  friends: Friend[]; onOpenPanel: () => void; onMessageFriend: (friend: Friend) => void;
}) {
  return (
    <div className="px-3 py-2" style={{ borderTop: "1px solid var(--border-primary)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Circle</span>
          {friends.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>{friends.length}</span>
          )}
        </div>
        <button onClick={onOpenPanel} className="p-1 rounded transition-colors" style={{ color: "var(--text-tertiary)" }}>
          <UserPlus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {friends.slice(0, 8).map((friend) => (
          <button key={friend.id} onClick={() => onMessageFriend(friend)}
            className="relative flex-shrink-0" title={friend.name}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-transform hover:scale-110"
              style={{ background: friend.avatarColor }}>{friend.avatar}</div>
          </button>
        ))}
        {friends.length > 8 && (
          <button onClick={onOpenPanel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>+{friends.length - 8}</button>
        )}
      </div>
    </div>
  );
}
