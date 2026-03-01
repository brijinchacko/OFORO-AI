"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users, UserPlus, Search, X, Check, XCircle, MessageSquare,
  Share2, MoreHorizontal, Trash2, Circle, Palette
} from "lucide-react";

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string; // single letter or emoji
  avatarColor: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
  addedAt: string;
}

export interface FriendRequest {
  id: string;
  from: Friend;
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

// Simulated users for demo
const DEMO_USERS: Friend[] = [
  { id: "demo-1", name: "Alex Chen", email: "alex@oforo.com", avatar: "A", avatarColor: "#3b82f6", status: "online", addedAt: new Date().toISOString() },
  { id: "demo-2", name: "Sarah Williams", email: "sarah@oforo.com", avatar: "S", avatarColor: "#8b5cf6", status: "away", lastSeen: "2 min ago", addedAt: new Date().toISOString() },
  { id: "demo-3", name: "James Taylor", email: "james@oforo.com", avatar: "J", avatarColor: "#22c55e", status: "offline", lastSeen: "1 hour ago", addedAt: new Date().toISOString() },
  { id: "demo-4", name: "Maya Patel", email: "maya@oforo.com", avatar: "M", avatarColor: "#ec4899", status: "online", addedAt: new Date().toISOString() },
  { id: "demo-5", name: "David Kim", email: "david@oforo.com", avatar: "D", avatarColor: "#f97316", status: "offline", lastSeen: "3 hours ago", addedAt: new Date().toISOString() },
];

export default function FriendsPanel({
  isOpen, onClose, onMessageFriend, onShareThread, onShareCanvas, currentUser,
}: FriendsPanelProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "add">("friends");
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load friends from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem("oforo-friends");
      if (saved) {
        setFriends(JSON.parse(saved));
      } else {
        // Initialize with demo friends
        setFriends(DEMO_USERS);
        localStorage.setItem("oforo-friends", JSON.stringify(DEMO_USERS));
      }
      const savedReqs = localStorage.getItem("oforo-friend-requests");
      if (savedReqs) setRequests(JSON.parse(savedReqs));
    } catch { /* ignore */ }
  }, [isOpen]);

  // Save friends to localStorage
  function saveFriends(updated: Friend[]) {
    setFriends(updated);
    localStorage.setItem("oforo-friends", JSON.stringify(updated));
  }

  function saveRequests(updated: FriendRequest[]) {
    setRequests(updated);
    localStorage.setItem("oforo-friend-requests", JSON.stringify(updated));
  }

  // Filter friends by search
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter((f) => f.status === "online");
  const offlineFriends = filteredFriends.filter((f) => f.status !== "online");

  // Add friend by email
  function handleAddFriend() {
    if (!addEmail.trim()) return;
    const existing = friends.find((f) => f.email.toLowerCase() === addEmail.toLowerCase());
    if (existing) {
      setAddSuccess("Already in your Circle!");
      setTimeout(() => setAddSuccess(null), 2000);
      return;
    }
    const newFriend: Friend = {
      id: "friend-" + Date.now(),
      name: addEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: addEmail.trim().toLowerCase(),
      avatar: addEmail.charAt(0).toUpperCase(),
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      status: Math.random() > 0.5 ? "online" : "offline",
      lastSeen: "Just added",
      addedAt: new Date().toISOString(),
    };
    saveFriends([newFriend, ...friends]);
    setAddEmail("");
    setAddSuccess(`${newFriend.name} added!`);
    setTimeout(() => setAddSuccess(null), 2000);

    // Create notification
    const notifications = JSON.parse(localStorage.getItem("oforo-notifications") || "[]");
    notifications.unshift({
      id: "notif-" + Date.now(),
      type: "friend_added",
      title: "New Friend",
      message: `${newFriend.name} was added to your friends`,
      timestamp: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem("oforo-notifications", JSON.stringify(notifications));
  }

  function handleAcceptRequest(reqId: string) {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    saveFriends([req.from, ...friends]);
    saveRequests(requests.map((r) => r.id === reqId ? { ...r, status: "accepted" as const } : r));
  }

  function handleDeclineRequest(reqId: string) {
    saveRequests(requests.map((r) => r.id === reqId ? { ...r, status: "declined" as const } : r));
  }

  function handleRemoveFriend(friendId: string) {
    saveFriends(friends.filter((f) => f.id !== friendId));
    setContextMenuId(null);
  }

  // Simulate random status changes
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setFriends((prev) => {
        const updated = prev.map((f) => ({
          ...f,
          status: Math.random() > 0.7
            ? (["online", "offline", "away"] as const)[Math.floor(Math.random() * 3)]
            : f.status,
        }));
        localStorage.setItem("oforo-friends", JSON.stringify(updated));
        return updated;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const pendingRequests = requests.filter((r) => r.status === "pending");

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
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>MAX</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3">
          {[
            { id: "friends" as const, label: "Circle", count: friends.length },
            { id: "requests" as const, label: "Requests", count: pendingRequests.length },
            { id: "add" as const, label: "Add People", count: 0 },
          ].map((tab) => (
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-transparent"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
              </div>

              {/* Online */}
              {onlineFriends.length > 0 && (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Online — {onlineFriends.length}
                  </p>
                  {onlineFriends.map((friend) => (
                    <FriendItem key={friend.id} friend={friend}
                      showContextMenu={contextMenuId === friend.id}
                      onToggleMenu={() => setContextMenuId(contextMenuId === friend.id ? null : friend.id)}
                      onMessage={() => onMessageFriend(friend)}
                      onShareThread={() => onShareThread(friend)}
                      onShareCanvas={() => onShareCanvas(friend)}
                      onRemove={() => handleRemoveFriend(friend.id)} />
                  ))}
                </>
              )}

              {/* Offline */}
              {offlineFriends.length > 0 && (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-wider mt-2" style={{ color: "var(--text-tertiary)" }}>
                    Offline — {offlineFriends.length}
                  </p>
                  {offlineFriends.map((friend) => (
                    <FriendItem key={friend.id} friend={friend}
                      showContextMenu={contextMenuId === friend.id}
                      onToggleMenu={() => setContextMenuId(contextMenuId === friend.id ? null : friend.id)}
                      onMessage={() => onMessageFriend(friend)}
                      onShareThread={() => onShareThread(friend)}
                      onShareCanvas={() => onShareCanvas(friend)}
                      onRemove={() => handleRemoveFriend(friend.id)} />
                  ))}
                </>
              )}

              {filteredFriends.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    {searchQuery ? "No one found" : "Add people to your Circle to start collaborating"}
                  </p>
                  <button onClick={() => setActiveTab("add")}
                    className="mt-2 px-4 py-1.5 text-xs font-medium rounded-lg"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    <UserPlus className="w-3 h-3 inline mr-1" /> Add to Circle
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No pending requests</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: req.from.avatarColor }}>{req.from.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{req.from.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{req.from.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleAcceptRequest(req.id)}
                        className="p-1.5 rounded-lg transition-colors" style={{ color: "#22c55e" }}>
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeclineRequest(req.id)}
                        className="p-1.5 rounded-lg transition-colors" style={{ color: "#ef4444" }}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "add" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Add to your Circle by email</label>
                <div className="flex gap-2">
                  <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="flex-1 px-3 py-2 rounded-lg text-sm bg-transparent"
                    style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddFriend(); }} />
                  <button onClick={handleAddFriend}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    Add
                  </button>
                </div>
                {addSuccess && (
                  <p className="text-xs mt-2 text-green-500">{addSuccess}</p>
                )}
              </div>

              {/* Suggested users */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Suggested</p>
                <div className="space-y-2">
                  {DEMO_USERS.filter((d) => !friends.some((f) => f.email === d.email)).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: user.avatarColor }}>{user.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{user.email}</p>
                      </div>
                      <button onClick={() => {
                        saveFriends([user, ...friends]);
                        setAddSuccess(`${user.name} added!`);
                        setTimeout(() => setAddSuccess(null), 2000);
                      }}
                        className="px-3 py-1 text-xs font-medium rounded-lg"
                        style={{ background: "var(--bg-hover)", color: "var(--accent)" }}>
                        Add
                      </button>
                    </div>
                  ))}
                  {DEMO_USERS.filter((d) => !friends.some((f) => f.email === d.email)).length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: "var(--text-tertiary)" }}>All suggested users added!</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FriendItem({ friend, showContextMenu, onToggleMenu, onMessage, onShareThread, onShareCanvas, onRemove }: {
  friend: Friend;
  showContextMenu: boolean;
  onToggleMenu: () => void;
  onMessage: () => void;
  onShareThread: () => void;
  onShareCanvas: () => void;
  onRemove: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showContextMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onToggleMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showContextMenu, onToggleMenu]);

  return (
    <div className="relative flex items-center gap-3 p-2 rounded-lg transition-colors group"
      style={{ background: "var(--bg-secondary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}>
      {/* Avatar with status dot */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: friend.avatarColor }}>{friend.avatar}</div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
          style={{
            borderColor: "var(--bg-secondary)",
            background: friend.status === "online" ? "#22c55e" : friend.status === "away" ? "#eab308" : "#6b7280",
          }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{friend.name}</p>
        <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
          {friend.status === "online" ? "Online" : friend.lastSeen ? `Last seen ${friend.lastSeen}` : "Offline"}
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-0.5">
        <button onClick={onMessage} className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: "var(--text-tertiary)" }} title="Send message">
          <MessageSquare className="w-4 h-4" />
        </button>
        <button onClick={onToggleMenu} className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: "var(--text-tertiary)" }} title="More actions">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Context menu */}
      {showContextMenu && (
        <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-2xl z-50 py-1 animate-fade-in"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
          <button onClick={() => { onMessage(); onToggleMenu(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <MessageSquare className="w-3.5 h-3.5" /> Send Message
          </button>
          <button onClick={() => { onShareThread(); onToggleMenu(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Share2 className="w-3.5 h-3.5" /> Share Chat Thread
          </button>
          <button onClick={() => { onShareCanvas(); onToggleMenu(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Palette className="w-3.5 h-3.5" /> Share Canvas
          </button>
          <div className="my-1" style={{ borderTop: "1px solid var(--border-primary)" }} />
          <button onClick={onRemove}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors text-red-400"
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <Trash2 className="w-3.5 h-3.5" /> Remove Friend
          </button>
        </div>
      )}
    </div>
  );
}

// Compact friends bar for sidebar bottom
export function FriendsBar({ friends, onOpenPanel, onMessageFriend }: {
  friends: Friend[];
  onOpenPanel: () => void;
  onMessageFriend: (friend: Friend) => void;
}) {
  const onlineFriends = friends.filter((f) => f.status === "online");

  return (
    <div className="px-3 py-2" style={{ borderTop: "1px solid var(--border-primary)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Circle
          </span>
          {onlineFriends.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
              {onlineFriends.length} online
            </span>
          )}
        </div>
        <button onClick={onOpenPanel} className="p-1 rounded transition-colors" style={{ color: "var(--text-tertiary)" }}>
          <UserPlus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {friends.slice(0, 8).map((friend) => (
          <button key={friend.id} onClick={() => onMessageFriend(friend)}
            className="relative flex-shrink-0" title={`${friend.name} (${friend.status})`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-transform hover:scale-110"
              style={{ background: friend.avatarColor }}>{friend.avatar}</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{
                borderColor: "var(--bg-secondary)",
                background: friend.status === "online" ? "#22c55e" : friend.status === "away" ? "#eab308" : "#6b7280",
              }} />
          </button>
        ))}
        {friends.length > 8 && (
          <button onClick={onOpenPanel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>
            +{friends.length - 8}
          </button>
        )}
      </div>
    </div>
  );
}
