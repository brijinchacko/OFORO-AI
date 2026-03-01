"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Plus, Check, Calendar, Bell, Clock,
  Trash2, ChevronDown, ChevronRight, Flag, AlertCircle,
  CheckCircle2, Circle as CircleIcon,
  Download, ExternalLink,
} from "lucide-react";

/* ═══════ TYPES ═══════ */
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO date string
  dueTime?: string; // HH:mm
  priority: "low" | "medium" | "high";
  category: string;
  createdAt: string;
  notified?: boolean;
}

interface TodoNotification {
  id: string;
  todoId: string;
  text: string;
  dueDate: string;
  dueTime?: string;
  type: "due" | "overdue" | "reminder";
  shown: boolean;
}

interface TodoTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFromChat?: (text: string) => void; // Callback when AI creates a todo
}

/* ═══════ NOTIFICATION POPUP ═══════ */
function NotificationPopup({ notification, onDismiss, onComplete }: {
  notification: TodoNotification;
  onDismiss: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[200] w-80 rounded-xl shadow-2xl animate-slide-up"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg flex-shrink-0"
            style={{
              background: notification.type === "overdue" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
            }}>
            {notification.type === "overdue" ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <Bell className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: notification.type === "overdue" ? "#ef4444" : "var(--accent)" }}>
              {notification.type === "overdue" ? "Overdue Task" : "Task Due"}
            </p>
            <p className="text-sm font-medium mb-1">{notification.text}</p>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(notification.dueDate).toLocaleDateString()}</span>
              {notification.dueTime && (
                <>
                  <Clock className="w-3 h-3 ml-1" />
                  <span>{notification.dueTime}</span>
                </>
              )}
            </div>
          </div>
          <button onClick={onDismiss} className="p-1 rounded flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}>
            <Check className="w-3 h-3" /> Mark Complete
          </button>
          <button onClick={onDismiss}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-primary)" }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════ MAIN COMPONENT ═══════ */
export default function TodoTracker({ isOpen, onClose }: TodoTrackerProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newCategory, setNewCategory] = useState("General");
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [notifications, setNotifications] = useState<TodoNotification[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["General"]));
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [msToken, setMsToken] = useState<string>("");
  const [appleId, setAppleId] = useState("");
  const [appleAppPassword, setAppleAppPassword] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load todos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("oforo-todos");
    if (saved) {
      try { setTodos(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem("oforo-todos", JSON.stringify(todos));
  }, [todos]);

  // Check for due/overdue tasks every minute
  useEffect(() => {
    function checkDueTasks() {
      const now = new Date();
      const newNotifs: TodoNotification[] = [];

      todos.forEach((todo) => {
        if (todo.completed || todo.notified || !todo.dueDate) return;

        const dueDateTime = new Date(todo.dueDate);
        if (todo.dueTime) {
          const [hours, minutes] = todo.dueTime.split(":").map(Number);
          dueDateTime.setHours(hours, minutes, 0, 0);
        } else {
          dueDateTime.setHours(23, 59, 59, 999);
        }

        const diff = dueDateTime.getTime() - now.getTime();
        const isOverdue = diff < 0;
        const isDueSoon = diff > 0 && diff < 30 * 60 * 1000; // 30 min

        if (isOverdue || isDueSoon) {
          newNotifs.push({
            id: `notif-${todo.id}-${Date.now()}`,
            todoId: todo.id,
            text: todo.text,
            dueDate: todo.dueDate,
            dueTime: todo.dueTime,
            type: isOverdue ? "overdue" : "due",
            shown: false,
          });
          // Mark as notified so we don't spam
          setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, notified: true } : t));
        }
      });

      if (newNotifs.length > 0) {
        setNotifications((prev) => [...prev, ...newNotifs]);
      }
    }

    checkDueTasks();
    const interval = setInterval(checkDueTasks, 60 * 1000);
    return () => clearInterval(interval);
  }, [todos]);

  // Load saved Microsoft token
  useEffect(() => {
    const savedToken = localStorage.getItem("oforo-ms-token");
    if (savedToken) setMsToken(savedToken);
    const savedAppleId = localStorage.getItem("oforo-apple-id");
    if (savedAppleId) setAppleId(savedAppleId);
  }, []);

  // Handle Microsoft OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const msCode = urlParams.get("ms_todo_code");
    if (msCode) {
      // Exchange code for token
      fetch("/api/todo/microsoft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "callback", code: msCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.accessToken) {
            setMsToken(data.accessToken);
            localStorage.setItem("oforo-ms-token", data.accessToken);
            setSyncStatus("Connected to Microsoft To Do!");
          }
        })
        .catch(() => setSyncStatus("Failed to connect to Microsoft"));

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ── Microsoft To Do sync ──
  async function syncToMicrosoft() {
    if (!msToken) {
      // Start OAuth flow
      try {
        const res = await fetch("/api/todo/microsoft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "auth-url" }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch {
        setSyncStatus("Failed to start Microsoft sign-in");
      }
      return;
    }

    setIsSyncing(true);
    setSyncStatus("Syncing to Microsoft To Do...");
    try {
      const activeTasks = todos.filter((t) => !t.completed);
      const res = await fetch("/api/todo/microsoft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", accessToken: msToken, todos: activeTasks }),
      });
      const data = await res.json();
      if (data.synced !== undefined) {
        setSyncStatus(`Synced ${data.synced}/${data.total} tasks to Microsoft To Do`);
      } else {
        setSyncStatus(data.error || "Sync failed");
        if (data.error?.includes("Failed to fetch")) {
          // Token expired, clear it
          setMsToken("");
          localStorage.removeItem("oforo-ms-token");
        }
      }
    } catch {
      setSyncStatus("Sync failed. Please try again.");
    }
    setIsSyncing(false);
  }

  // ── Apple Reminders sync ──
  async function syncToApple() {
    if (!appleId || !appleAppPassword) {
      setSyncStatus("Enter your Apple ID and App-Specific Password first");
      return;
    }

    setIsSyncing(true);
    setSyncStatus("Syncing to Apple Reminders...");

    try {
      const activeTasks = todos.filter((t) => !t.completed);
      const res = await fetch("/api/todo/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", appleId, appPassword: appleAppPassword, todos: activeTasks }),
      });
      const data = await res.json();

      if (data.method === "ics-fallback") {
        // CalDAV didn't work, offer ICS download
        setSyncStatus("CalDAV not available — downloading ICS file for manual import instead");
        downloadICS();
      } else if (data.synced !== undefined) {
        setSyncStatus(`Synced ${data.synced}/${data.total} tasks to Apple Reminders`);
        // Save Apple ID (not password) for next time
        localStorage.setItem("oforo-apple-id", appleId);
      } else {
        setSyncStatus(data.error || data.message || "Sync failed");
      }
    } catch {
      setSyncStatus("Sync failed. Downloading ICS file instead...");
      downloadICS();
    }
    setIsSyncing(false);
  }

  // ── ICS download (universal fallback) ──
  function downloadICS() {
    const activeTasks = todos.filter((t) => !t.completed);
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Oforo//Tasks//EN",
      "CALSCALE:GREGORIAN",
    ];
    activeTasks.forEach((todo) => {
      const uid = `oforo-${todo.id}@oforo.com`;
      const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      let dtStart = now.slice(0, 8);
      if (todo.dueDate) dtStart = todo.dueDate.replace(/-/g, "");
      icsLines.push("BEGIN:VTODO");
      icsLines.push(`UID:${uid}`);
      icsLines.push(`DTSTAMP:${now}`);
      icsLines.push(`SUMMARY:${todo.text}`);
      if (todo.dueDate) {
        if (todo.dueTime) {
          icsLines.push(`DUE:${dtStart}T${todo.dueTime.replace(":", "")}00`);
        } else {
          icsLines.push(`DUE;VALUE=DATE:${dtStart}`);
        }
      }
      icsLines.push(`PRIORITY:${todo.priority === "high" ? 1 : todo.priority === "medium" ? 5 : 9}`);
      icsLines.push(`CATEGORIES:${todo.category}`);
      icsLines.push("BEGIN:VALARM");
      icsLines.push("TRIGGER:-PT30M");
      icsLines.push("ACTION:DISPLAY");
      icsLines.push(`DESCRIPTION:${todo.text}`);
      icsLines.push("END:VALARM");
      icsLines.push("END:VTODO");
    });
    icsLines.push("END:VCALENDAR");
    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oforo-tasks.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  function addTodo() {
    if (!newTodoText.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      dueDate: newDueDate || undefined,
      dueTime: newDueTime || undefined,
      priority: newPriority,
      category: newCategory || "General",
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    setNewTodoText("");
    setNewDueDate("");
    setNewDueTime("");
    setNewPriority("medium");
    setShowAddForm(false);
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function completeFromNotification(todoId: string, notifId: string) {
    toggleTodo(todoId);
    dismissNotification(notifId);
  }

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const categories = Array.from(new Set(filteredTodos.map((t) => t.category)));
  const activeTodos = todos.filter((t) => !t.completed);
  const completedCount = todos.filter((t) => t.completed).length;

  const priorityColors = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };
  const priorityLabels = { low: "Low", medium: "Medium", high: "High" };

  // Render notifications even when panel is closed
  const activeNotifs = notifications.slice(0, 1); // Show one at a time

  return (
    <>
      {/* ── Notification Popups (always visible) ── */}
      {activeNotifs.map((notif) => (
        <NotificationPopup
          key={notif.id}
          notification={notif}
          onDismiss={() => dismissNotification(notif.id)}
          onComplete={() => completeFromNotification(notif.todoId, notif.id)}
        />
      ))}

      {/* ── Todo Panel ── */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[70]" onClick={onClose} />
          <div className="fixed right-0 top-0 bottom-0 w-96 max-w-full z-[75] flex flex-col animate-slide-in-right"
            style={{ background: "var(--bg-primary)", borderLeft: "1px solid var(--border-primary)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  Tasks
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {activeTodos.length} active &middot; {completedCount} completed
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              {(["all", "active", "completed"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize"
                  style={{
                    background: filter === f ? "var(--bg-hover)" : "transparent",
                    color: filter === f ? "var(--text-primary)" : "var(--text-tertiary)",
                    border: filter === f ? "1px solid var(--border-hover)" : "1px solid transparent",
                  }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Add new task */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              {!showAddForm ? (
                <button onClick={() => { setShowAddForm(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors"
                  style={{ border: "1px dashed var(--border-primary)", color: "var(--text-tertiary)" }}>
                  <Plus className="w-4 h-4" /> Add a task
                </button>
              ) : (
                <div className="space-y-2">
                  <input ref={inputRef} type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTodo(); if (e.key === "Escape") setShowAddForm(false); }}
                    placeholder="What needs to be done?"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-transparent focus:outline-none"
                    style={{ border: "1px solid var(--border-hover)", color: "var(--text-primary)" }} />
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                        style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                    </div>
                    <div className="w-24">
                      <input type="time" value={newDueTime} onChange={(e) => setNewDueTime(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                        style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                      className="px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                      style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Category"
                      className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                      style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={addTodo} disabled={!newTodoText.trim()}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                      style={{ background: newTodoText.trim() ? "var(--accent)" : "var(--bg-tertiary)", color: newTodoText.trim() ? "#fff" : "var(--text-tertiary)" }}>
                      Add Task
                    </button>
                    <button onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                      style={{ color: "var(--text-tertiary)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Todo list */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {filteredTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="w-8 h-8 mb-2" style={{ color: "var(--text-tertiary)", opacity: 0.3 }} />
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {filter === "completed" ? "No completed tasks yet" : "No tasks yet. Add one above!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const catTodos = filteredTodos.filter((t) => t.category === cat);
                    const isExpanded = expandedCategories.has(cat);
                    return (
                      <div key={cat}>
                        <button onClick={() => toggleCategory(cat)}
                          className="w-full flex items-center gap-1.5 px-1 py-1.5 text-xs font-medium rounded transition-colors"
                          style={{ color: "var(--text-tertiary)" }}>
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {cat}
                          <span className="ml-auto text-[10px]" style={{ color: "var(--text-tertiary)" }}>{catTodos.length}</span>
                        </button>
                        {isExpanded && (
                          <div className="space-y-0.5 ml-1 mb-2">
                            {catTodos.map((todo) => {
                              const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();
                              return (
                                <div key={todo.id}
                                  className="group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors"
                                  style={{ background: "transparent" }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                  <button onClick={() => toggleTodo(todo.id)} className="mt-0.5 flex-shrink-0">
                                    {todo.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <CircleIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${todo.completed ? "line-through" : ""}`}
                                      style={{ color: todo.completed ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                                      {todo.text}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {/* Priority flag */}
                                      <span className="flex items-center gap-0.5 text-[10px]" style={{ color: priorityColors[todo.priority] }}>
                                        <Flag className="w-2.5 h-2.5" /> {priorityLabels[todo.priority]}
                                      </span>
                                      {/* Due date */}
                                      {todo.dueDate && (
                                        <span className="flex items-center gap-0.5 text-[10px]"
                                          style={{ color: isOverdue ? "#ef4444" : "var(--text-tertiary)" }}>
                                          <Calendar className="w-2.5 h-2.5" />
                                          {new Date(todo.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                          {todo.dueTime && ` ${todo.dueTime}`}
                                          {isOverdue && " (overdue)"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button onClick={() => deleteTodo(todo.id)}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    style={{ color: "var(--text-tertiary)" }}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with stats and sync */}
            <div className="px-4 py-3 space-y-2" style={{ borderTop: "1px solid var(--border-primary)" }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  {activeTodos.length === 0 ? "All done!" : `${activeTodos.length} task${activeTodos.length > 1 ? "s" : ""} remaining`}
                </p>
                <div className="flex items-center gap-2">
                  {completedCount > 0 && (
                    <button onClick={() => setTodos((prev) => prev.filter((t) => !t.completed))}
                      className="text-[11px] font-medium transition-colors"
                      style={{ color: "var(--text-tertiary)" }}>
                      Clear done
                    </button>
                  )}
                  <button onClick={() => setShowSyncPanel(!showSyncPanel)}
                    className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                    style={{ color: "var(--accent)" }}>
                    <ExternalLink className="w-3 h-3" /> Sync
                  </button>
                </div>
              </div>

              {/* ── Sync panel ── */}
              {showSyncPanel && (
                <div className="rounded-lg p-3 space-y-3 animate-fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Sync tasks to</p>

                  {/* Microsoft To Do */}
                  <div className="space-y-1.5">
                    <button
                      onClick={syncToMicrosoft}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                      style={{ background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}>
                      <svg viewBox="0 0 21 21" className="w-4 h-4 flex-shrink-0"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
                      {msToken ? "Sync to Microsoft To Do" : "Connect Microsoft To Do"}
                      {msToken && <Check className="w-3 h-3 ml-auto text-green-500" />}
                    </button>
                    {msToken && (
                      <button onClick={() => { setMsToken(""); localStorage.removeItem("oforo-ms-token"); setSyncStatus("Disconnected from Microsoft"); }}
                        className="text-[10px] ml-1 transition-colors" style={{ color: "var(--text-tertiary)" }}>
                        Disconnect
                      </button>
                    )}
                  </div>

                  {/* Apple Reminders */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        if (appleId && appleAppPassword) {
                          syncToApple();
                        } else {
                          setSyncStatus("apple-setup");
                        }
                      }}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                      style={{ background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      {appleId ? "Sync to Apple Reminders" : "Connect Apple Reminders"}
                      {appleId && <Check className="w-3 h-3 ml-auto text-green-500" />}
                    </button>

                    {syncStatus === "apple-setup" && (
                      <div className="space-y-1.5 mt-2 animate-fade-in">
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          Create an App-Specific Password at <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent)" }}>appleid.apple.com</a>
                        </p>
                        <input type="email" value={appleId} onChange={(e) => setAppleId(e.target.value)}
                          placeholder="Apple ID (email)"
                          className="w-full px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
                        <input type="password" value={appleAppPassword} onChange={(e) => setAppleAppPassword(e.target.value)}
                          placeholder="App-Specific Password"
                          className="w-full px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
                        <button onClick={syncToApple} disabled={!appleId || !appleAppPassword || isSyncing}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                          style={{ background: "var(--accent)", color: "#fff", opacity: appleId && appleAppPassword ? 1 : 0.5 }}>
                          Connect & Sync
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ICS Download fallback */}
                  <button onClick={downloadICS}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                    <Download className="w-3.5 h-3.5" />
                    Download .ics file (import to any calendar)
                  </button>

                  {/* Status message */}
                  {syncStatus && syncStatus !== "apple-setup" && (
                    <p className="text-[10px] px-1" style={{ color: syncStatus.includes("fail") || syncStatus.includes("error") ? "#ef4444" : "var(--accent)" }}>
                      {syncStatus}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════ EXPORTED: Hook for AI to create todos from chat ═══════ */
export function parseTodosFromAIResponse(content: string): { text: string; dueDate?: string; priority: "low" | "medium" | "high" }[] {
  const todos: { text: string; dueDate?: string; priority: "low" | "medium" | "high" }[] = [];

  // Detect patterns like "- [ ] Task text" or "TODO: Task text" or numbered lists with action items
  const patterns = [
    /[-*]\s*\[[\sx]?\]\s*(.+)/gi,    // - [ ] task  or  - [x] task
    /TODO:\s*(.+)/gi,                  // TODO: task
    /TASK:\s*(.+)/gi,                  // TASK: task
    /ACTION:\s*(.+)/gi,                // ACTION: task
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const taskText = match[1].trim();
      if (taskText.length > 2 && taskText.length < 200) {
        // Try to detect priority
        let priority: "low" | "medium" | "high" = "medium";
        if (/urgent|critical|important|high/i.test(taskText)) priority = "high";
        if (/low|minor|optional/i.test(taskText)) priority = "low";

        // Try to detect dates
        let dueDate: string | undefined;
        const dateMatch = taskText.match(/by\s+(\d{4}-\d{2}-\d{2})/i) || taskText.match(/due\s+(\d{4}-\d{2}-\d{2})/i);
        if (dateMatch) dueDate = dateMatch[1];

        todos.push({ text: taskText, dueDate, priority });
      }
    }
  }

  return todos;
}
