"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Plus, Check, Calendar, Bell, Clock,
  Trash2, ChevronDown, ChevronRight, Flag, AlertCircle,
  CheckCircle2, Circle as CircleIcon,
  Download, ExternalLink, Play, RefreshCw, Edit3,
} from "lucide-react";

/* ══════════════════════════ TYPES ══════════════════════════ */

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
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

interface ScheduledQuery {
  id: string;
  prompt: string;
  schedule: ScheduleConfig;
  enabled: boolean;
  lastRun?: string;
  lastResult?: string;
  nextRun?: string;
  createdAt: string;
  webSearch: boolean;
  modelId: string;
}

interface ScheduleConfig {
  type: "daily" | "weekly" | "monthly" | "custom";
  time: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  intervalMinutes?: number;
}

interface TaskHubProps {
  isOpen: boolean;
  onClose: () => void;
  onRunQuery: (prompt: string, modelId: string, webSearch: boolean) => void;
}

/* ══════════════════ HELPERS ══════════════════ */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getScheduleLabel(s: ScheduleConfig): string {
  if (s.type === "daily") return `Daily at ${s.time}`;
  if (s.type === "weekly") {
    const days = (s.daysOfWeek || [0]).map((d) => DAY_NAMES[d]).join(", ");
    return `Every ${days} at ${s.time}`;
  }
  if (s.type === "monthly") return `Monthly on day ${s.dayOfMonth || 1} at ${s.time}`;
  if (s.type === "custom" && s.intervalMinutes) {
    if (s.intervalMinutes >= 60) return `Every ${s.intervalMinutes / 60}h`;
    return `Every ${s.intervalMinutes}min`;
  }
  return "Custom";
}

function getNextRunDate(s: ScheduleConfig): Date {
  const now = new Date();
  const [hours, minutes] = s.time.split(":").map(Number);
  if (s.type === "daily") {
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }
  if (s.type === "weekly" && s.daysOfWeek?.length) {
    const sorted = [...s.daysOfWeek].sort((a, b) => a - b);
    for (const day of sorted) {
      const next = new Date(now);
      const diff = (day - now.getDay() + 7) % 7;
      next.setDate(now.getDate() + (diff === 0 ? 0 : diff));
      next.setHours(hours, minutes, 0, 0);
      if (next > now) return next;
    }
    const next = new Date(now);
    const diff = (sorted[0] - now.getDay() + 7) % 7 || 7;
    next.setDate(now.getDate() + diff);
    next.setHours(hours, minutes, 0, 0);
    return next;
  }
  if (s.type === "monthly") {
    const next = new Date(now.getFullYear(), now.getMonth(), s.dayOfMonth || 1, hours, minutes);
    if (next <= now) next.setMonth(next.getMonth() + 1);
    return next;
  }
  if (s.type === "custom" && s.intervalMinutes) {
    return new Date(now.getTime() + s.intervalMinutes * 60 * 1000);
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

const priorityColors: Record<string, string> = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };
const priorityLabels: Record<string, string> = { low: "Low", medium: "Medium", high: "High" };

/* ══════════════════ NOTIFICATION POPUPS ══════════════════ */

function NotificationPopup({ notification, onDismiss, onComplete }: {
  notification: TodoNotification; onDismiss: () => void; onComplete: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[200] w-80 rounded-xl shadow-2xl animate-slide-up"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg flex-shrink-0"
            style={{ background: notification.type === "overdue" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)" }}>
            {notification.type === "overdue" ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Bell className="w-4 h-4 text-blue-400" />}
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
              {notification.dueTime && <><Clock className="w-3 h-3 ml-1" /><span>{notification.dueTime}</span></>}
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

export function ScheduledQueryNotification({ query, onDismiss, onView }: {
  query: ScheduledQuery; onDismiss: () => void; onView: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[200] w-80 rounded-xl shadow-2xl animate-slide-up"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>
              Scheduled Query Ran
            </p>
            <p className="text-sm font-medium mb-1 truncate">{query.prompt}</p>
            {query.lastResult && (
              <p className="text-xs line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
                {query.lastResult.slice(0, 120)}...
              </p>
            )}
          </div>
          <button onClick={onDismiss} className="p-1 rounded flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={onView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}>
            View Result
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

/* ══════════════════════════════════════════════════════════ */
/*                     MAIN TASK HUB                         */
/* ══════════════════════════════════════════════════════════ */

export default function TaskHub({ isOpen, onClose, onRunQuery }: TaskHubProps) {
  const [tab, setTab] = useState<"tasks" | "schedules">("tasks");

  /* ─────── TASKS STATE ─────── */
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newCategory, setNewCategory] = useState("General");
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [notifications, setNotifications] = useState<TodoNotification[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["General"]));
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [msToken, setMsToken] = useState("");
  const [appleId, setAppleId] = useState("");
  const [appleAppPassword, setAppleAppPassword] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const taskInputRef = useRef<HTMLInputElement>(null);

  /* ─────── SCHEDULES STATE ─────── */
  const [queries, setQueries] = useState<ScheduledQuery[]>([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState("");
  const [newType, setNewType] = useState<ScheduleConfig["type"]>("weekly");
  const [newTime, setNewTime] = useState("09:00");
  const [newDays, setNewDays] = useState<number[]>([1]);
  const [newDayOfMonth, setNewDayOfMonth] = useState(1);
  const [newWebSearch, setNewWebSearch] = useState(true);
  const [newModelId, setNewModelId] = useState("oforo-general");
  const scheduleInputRef = useRef<HTMLInputElement>(null);

  /* ═══════ LOAD / SAVE ═══════ */
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem("oforo-todos");
      if (savedTodos) setTodos(JSON.parse(savedTodos));
    } catch { /* ignore */ }
    try {
      const savedQ = localStorage.getItem("oforo-scheduled-queries");
      if (savedQ) setQueries(JSON.parse(savedQ));
    } catch { /* ignore */ }
    const savedToken = localStorage.getItem("oforo-ms-token");
    if (savedToken) setMsToken(savedToken);
    const savedApple = localStorage.getItem("oforo-apple-id");
    if (savedApple) setAppleId(savedApple);
  }, []);

  useEffect(() => { localStorage.setItem("oforo-todos", JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem("oforo-scheduled-queries", JSON.stringify(queries)); }, [queries]);

  /* ═══════ TODO NOTIFICATIONS ═══════ */
  useEffect(() => {
    function checkDueTasks() {
      const now = new Date();
      const newNotifs: TodoNotification[] = [];
      todos.forEach((todo) => {
        if (todo.completed || todo.notified || !todo.dueDate) return;
        const dueDateTime = new Date(todo.dueDate);
        if (todo.dueTime) {
          const [h, m] = todo.dueTime.split(":").map(Number);
          dueDateTime.setHours(h, m, 0, 0);
        } else {
          dueDateTime.setHours(23, 59, 59, 999);
        }
        const diff = dueDateTime.getTime() - now.getTime();
        if (diff < 0 || (diff > 0 && diff < 30 * 60 * 1000)) {
          newNotifs.push({
            id: `notif-${todo.id}-${Date.now()}`, todoId: todo.id, text: todo.text,
            dueDate: todo.dueDate, dueTime: todo.dueTime, type: diff < 0 ? "overdue" : "due", shown: false,
          });
          setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, notified: true } : t));
        }
      });
      if (newNotifs.length) setNotifications((prev) => [...prev, ...newNotifs]);
    }
    checkDueTasks();
    const interval = setInterval(checkDueTasks, 60 * 1000);
    return () => clearInterval(interval);
  }, [todos]);

  /* ═══════ SCHEDULER ═══════ */
  useEffect(() => {
    function checkSchedules() {
      const now = new Date();
      setQueries((prev) =>
        prev.map((q) => {
          if (!q.enabled || !q.nextRun) return q;
          if (now >= new Date(q.nextRun)) {
            onRunQuery(q.prompt, q.modelId, q.webSearch);
            return { ...q, lastRun: now.toISOString(), nextRun: getNextRunDate(q.schedule).toISOString() };
          }
          return q;
        })
      );
    }
    const interval = setInterval(checkSchedules, 60 * 1000);
    return () => clearInterval(interval);
  }, [onRunQuery]);

  /* ═══════ MS OAUTH CALLBACK ═══════ */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const msCode = urlParams.get("ms_todo_code");
    if (msCode) {
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
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  /* ═══════ TASK FUNCTIONS ═══════ */
  function addTodo() {
    if (!newTodoText.trim()) return;
    setTodos((prev) => [{
      id: Date.now().toString(), text: newTodoText.trim(), completed: false,
      dueDate: newDueDate || undefined, dueTime: newDueTime || undefined,
      priority: newPriority, category: newCategory || "General", createdAt: new Date().toISOString(),
    }, ...prev]);
    setNewTodoText(""); setNewDueDate(""); setNewDueTime(""); setNewPriority("medium"); setShowAddTask(false);
  }
  function toggleTodo(id: string) { setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)); }
  function deleteTodo(id: string) { setTodos((prev) => prev.filter((t) => t.id !== id)); }
  function dismissNotification(id: string) { setNotifications((prev) => prev.filter((n) => n.id !== id)); }
  function completeFromNotification(todoId: string, notifId: string) { toggleTodo(todoId); dismissNotification(notifId); }
  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => { const next = new Set(prev); if (next.has(cat)) next.delete(cat); else next.add(cat); return next; });
  }

  async function syncToMicrosoft() {
    if (!msToken) {
      try {
        const res = await fetch("/api/todo/microsoft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "auth-url" }) });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch { setSyncStatus("Failed to start Microsoft sign-in"); }
      return;
    }
    setIsSyncing(true); setSyncStatus("Syncing...");
    try {
      const res = await fetch("/api/todo/microsoft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sync", accessToken: msToken, todos: todos.filter((t) => !t.completed) }) });
      const data = await res.json();
      if (data.synced !== undefined) setSyncStatus(`Synced ${data.synced}/${data.total} tasks`);
      else { setSyncStatus(data.error || "Sync failed"); if (data.error?.includes("Failed")) { setMsToken(""); localStorage.removeItem("oforo-ms-token"); } }
    } catch { setSyncStatus("Sync failed"); }
    setIsSyncing(false);
  }

  async function syncToApple() {
    if (!appleId || !appleAppPassword) { setSyncStatus("Enter Apple ID & App-Specific Password"); return; }
    setIsSyncing(true); setSyncStatus("Syncing...");
    try {
      const res = await fetch("/api/todo/apple", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sync", appleId, appPassword: appleAppPassword, todos: todos.filter((t) => !t.completed) }) });
      const data = await res.json();
      if (data.method === "ics-fallback") { setSyncStatus("CalDAV unavailable — downloading ICS instead"); downloadICS(); }
      else if (data.synced !== undefined) { setSyncStatus(`Synced ${data.synced}/${data.total} tasks`); localStorage.setItem("oforo-apple-id", appleId); }
      else setSyncStatus(data.error || "Sync failed");
    } catch { setSyncStatus("Sync failed — downloading ICS"); downloadICS(); }
    setIsSyncing(false);
  }

  function downloadICS() {
    const active = todos.filter((t) => !t.completed);
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Oforo//Tasks//EN", "CALSCALE:GREGORIAN"];
    active.forEach((todo) => {
      const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      let dtStart = now.slice(0, 8);
      if (todo.dueDate) dtStart = todo.dueDate.replace(/-/g, "");
      lines.push("BEGIN:VTODO", `UID:oforo-${todo.id}@oforo.com`, `DTSTAMP:${now}`, `SUMMARY:${todo.text}`);
      if (todo.dueDate) { if (todo.dueTime) lines.push(`DUE:${dtStart}T${todo.dueTime.replace(":", "")}00`); else lines.push(`DUE;VALUE=DATE:${dtStart}`); }
      lines.push(`PRIORITY:${todo.priority === "high" ? 1 : todo.priority === "medium" ? 5 : 9}`, `CATEGORIES:${todo.category}`);
      lines.push("BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", `DESCRIPTION:${todo.text}`, "END:VALARM", "END:VTODO");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "oforo-tasks.ics"; a.click();
    URL.revokeObjectURL(url);
  }

  /* ═══════ SCHEDULE FUNCTIONS ═══════ */
  function saveSchedule() {
    if (!newPrompt.trim()) return;
    const schedule: ScheduleConfig = { type: newType, time: newTime, daysOfWeek: newType === "weekly" ? newDays : undefined, dayOfMonth: newType === "monthly" ? newDayOfMonth : undefined };
    if (editingId) {
      setQueries((prev) => prev.map((q) => q.id === editingId ? { ...q, prompt: newPrompt.trim(), schedule, webSearch: newWebSearch, modelId: newModelId, nextRun: getNextRunDate(schedule).toISOString() } : q));
      setEditingId(null);
    } else {
      setQueries((prev) => [{ id: Date.now().toString(), prompt: newPrompt.trim(), schedule, enabled: true, nextRun: getNextRunDate(schedule).toISOString(), createdAt: new Date().toISOString(), webSearch: newWebSearch, modelId: newModelId }, ...prev]);
    }
    resetScheduleForm();
  }
  function resetScheduleForm() { setNewPrompt(""); setNewType("weekly"); setNewTime("09:00"); setNewDays([1]); setNewDayOfMonth(1); setNewWebSearch(true); setNewModelId("oforo-general"); setShowAddSchedule(false); setEditingId(null); }
  function editSchedule(q: ScheduledQuery) { setEditingId(q.id); setNewPrompt(q.prompt); setNewType(q.schedule.type); setNewTime(q.schedule.time); setNewDays(q.schedule.daysOfWeek || [1]); setNewDayOfMonth(q.schedule.dayOfMonth || 1); setNewWebSearch(q.webSearch); setNewModelId(q.modelId); setShowAddSchedule(true); }
  function deleteSchedule(id: string) { setQueries((prev) => prev.filter((q) => q.id !== id)); }
  function toggleSchedule(id: string) { setQueries((prev) => prev.map((q) => q.id === id ? { ...q, enabled: !q.enabled } : q)); }
  function toggleDay(day: number) { setNewDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()); }
  function runNow(q: ScheduledQuery) { onRunQuery(q.prompt, q.modelId, q.webSearch); setQueries((prev) => prev.map((sq) => sq.id === q.id ? { ...sq, lastRun: new Date().toISOString() } : sq)); }

  /* ═══════ DERIVED ═══════ */
  const filteredTodos = todos.filter((t) => { if (filter === "active") return !t.completed; if (filter === "completed") return t.completed; return true; });
  const categories = Array.from(new Set(filteredTodos.map((t) => t.category)));
  const activeTodos = todos.filter((t) => !t.completed);
  const completedCount = todos.filter((t) => t.completed).length;
  const activeNotifs = notifications.slice(0, 1);

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <>
      {/* Notifications (always visible) */}
      {activeNotifs.map((notif) => (
        <NotificationPopup key={notif.id} notification={notif}
          onDismiss={() => dismissNotification(notif.id)}
          onComplete={() => completeFromNotification(notif.todoId, notif.id)} />
      ))}

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[70]" onClick={onClose} />
          <div className="fixed right-0 top-0 bottom-0 w-[420px] max-w-full z-[75] flex flex-col animate-slide-in-right"
            style={{ background: "var(--bg-primary)", borderLeft: "1px solid var(--border-primary)" }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  Task Hub
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {activeTodos.length} task{activeTodos.length !== 1 ? "s" : ""} &middot; {queries.filter((q) => q.enabled).length} schedule{queries.filter((q) => q.enabled).length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center px-4 pt-2 gap-1" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              {([
                { id: "tasks" as const, label: "Tasks", icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: activeTodos.length },
                { id: "schedules" as const, label: "Schedules", icon: <Clock className="w-3.5 h-3.5" />, count: queries.filter((q) => q.enabled).length },
              ]).map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all relative"
                  style={{ color: tab === t.id ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                  {t.icon} {t.label}
                  {t.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                      style={{ background: tab === t.id ? "var(--accent)" : "var(--bg-hover)", color: tab === t.id ? "#fff" : "var(--text-tertiary)" }}>
                      {t.count}
                    </span>
                  )}
                  {tab === t.id && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: "var(--accent)" }} />
                  )}
                </button>
              ))}
            </div>

            {/* ═══ TASKS TAB ═══ */}
            {tab === "tasks" && (
              <>
                {/* Filters */}
                <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  {(["all", "active", "completed"] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className="px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize"
                      style={{
                        background: filter === f ? "var(--bg-hover)" : "transparent",
                        color: filter === f ? "var(--text-primary)" : "var(--text-tertiary)",
                        border: filter === f ? "1px solid var(--border-hover)" : "1px solid transparent",
                      }}>{f}</button>
                  ))}
                </div>

                {/* Add task */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  {!showAddTask ? (
                    <button onClick={() => { setShowAddTask(true); setTimeout(() => taskInputRef.current?.focus(), 100); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors"
                      style={{ border: "1px dashed var(--border-primary)", color: "var(--text-tertiary)" }}>
                      <Plus className="w-4 h-4" /> Add a task
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input ref={taskInputRef} type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addTodo(); if (e.key === "Escape") setShowAddTask(false); }}
                        placeholder="What needs to be done?"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-transparent focus:outline-none"
                        style={{ border: "1px solid var(--border-hover)", color: "var(--text-primary)" }} />
                      <div className="flex items-center gap-2">
                        <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                        <input type="time" value={newDueTime} onChange={(e) => setNewDueTime(e.target.value)}
                          className="w-24 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                          className="px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                        </select>
                        <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Category"
                          className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={addTodo} disabled={!newTodoText.trim()}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg"
                          style={{ background: newTodoText.trim() ? "var(--accent)" : "var(--bg-tertiary)", color: newTodoText.trim() ? "#fff" : "var(--text-tertiary)" }}>Add Task</button>
                        <button onClick={() => setShowAddTask(false)} className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ color: "var(--text-tertiary)" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Task list */}
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
                              className="w-full flex items-center gap-1.5 px-1 py-1.5 text-xs font-medium rounded"
                              style={{ color: "var(--text-tertiary)" }}>
                              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              {cat} <span className="ml-auto text-[10px]">{catTodos.length}</span>
                            </button>
                            {isExpanded && (
                              <div className="space-y-0.5 ml-1 mb-2">
                                {catTodos.map((todo) => {
                                  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();
                                  return (
                                    <div key={todo.id} className="group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors"
                                      style={{ background: "transparent" }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                      <button onClick={() => toggleTodo(todo.id)} className="mt-0.5 flex-shrink-0">
                                        {todo.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <CircleIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />}
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${todo.completed ? "line-through" : ""}`}
                                          style={{ color: todo.completed ? "var(--text-tertiary)" : "var(--text-primary)" }}>{todo.text}</p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: priorityColors[todo.priority] }}>
                                            <Flag className="w-2.5 h-2.5" /> {priorityLabels[todo.priority]}
                                          </span>
                                          {todo.dueDate && (
                                            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: isOverdue ? "#ef4444" : "var(--text-tertiary)" }}>
                                              <Calendar className="w-2.5 h-2.5" />
                                              {new Date(todo.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                              {todo.dueTime && ` ${todo.dueTime}`}{isOverdue && " (overdue)"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button onClick={() => deleteTodo(todo.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
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

                {/* Footer with sync */}
                <div className="px-4 py-3 space-y-2" style={{ borderTop: "1px solid var(--border-primary)" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {activeTodos.length === 0 ? "All done!" : `${activeTodos.length} task${activeTodos.length > 1 ? "s" : ""} remaining`}
                    </p>
                    <div className="flex items-center gap-2">
                      {completedCount > 0 && (
                        <button onClick={() => setTodos((prev) => prev.filter((t) => !t.completed))}
                          className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>Clear done</button>
                      )}
                      <button onClick={() => setShowSyncPanel(!showSyncPanel)}
                        className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "var(--accent)" }}>
                        <ExternalLink className="w-3 h-3" /> Sync
                      </button>
                    </div>
                  </div>

                  {showSyncPanel && (
                    <div className="rounded-lg p-3 space-y-3 animate-fade-in" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Sync tasks to</p>
                      <button onClick={syncToMicrosoft} disabled={isSyncing}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg"
                        style={{ background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}>
                        <svg viewBox="0 0 21 21" className="w-4 h-4 flex-shrink-0"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
                        {msToken ? "Sync to Microsoft To Do" : "Connect Microsoft To Do"}
                        {msToken && <Check className="w-3 h-3 ml-auto text-green-500" />}
                      </button>
                      {msToken && (
                        <button onClick={() => { setMsToken(""); localStorage.removeItem("oforo-ms-token"); setSyncStatus("Disconnected"); }}
                          className="text-[10px] ml-1" style={{ color: "var(--text-tertiary)" }}>Disconnect</button>
                      )}
                      <button onClick={() => { if (appleId && appleAppPassword) syncToApple(); else setSyncStatus("apple-setup"); }}
                        disabled={isSyncing}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg"
                        style={{ background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        {appleId ? "Sync to Apple Reminders" : "Connect Apple Reminders"}
                      </button>
                      {syncStatus === "apple-setup" && (
                        <div className="space-y-1.5 mt-2 animate-fade-in">
                          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            Create an App-Specific Password at <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent)" }}>appleid.apple.com</a>
                          </p>
                          <input type="email" value={appleId} onChange={(e) => setAppleId(e.target.value)} placeholder="Apple ID (email)"
                            className="w-full px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                            style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
                          <input type="password" value={appleAppPassword} onChange={(e) => setAppleAppPassword(e.target.value)} placeholder="App-Specific Password"
                            className="w-full px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                            style={{ border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
                          <button onClick={syncToApple} disabled={!appleId || !appleAppPassword || isSyncing}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg"
                            style={{ background: "var(--accent)", color: "#fff", opacity: appleId && appleAppPassword ? 1 : 0.5 }}>Connect & Sync</button>
                        </div>
                      )}
                      <button onClick={downloadICS}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg"
                        style={{ background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                        <Download className="w-3.5 h-3.5" /> Download .ics file
                      </button>
                      {syncStatus && syncStatus !== "apple-setup" && (
                        <p className="text-[10px] px-1" style={{ color: syncStatus.includes("fail") || syncStatus.includes("error") ? "#ef4444" : "var(--accent)" }}>{syncStatus}</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ═══ SCHEDULES TAB ═══ */}
            {tab === "schedules" && (
              <>
                {/* Add schedule */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  {!showAddSchedule ? (
                    <button onClick={() => { setShowAddSchedule(true); setTimeout(() => scheduleInputRef.current?.focus(), 100); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors"
                      style={{ border: "1px dashed var(--border-primary)", color: "var(--text-tertiary)" }}>
                      <Plus className="w-4 h-4" /> Schedule a recurring prompt
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Prompt</label>
                        <input ref={scheduleInputRef} type="text" value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)}
                          placeholder="e.g. Summarise this week's tech news"
                          className="w-full px-3 py-2 text-sm rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-hover)", color: "var(--text-primary)" }} />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Frequency</label>
                        <div className="flex items-center gap-1">
                          {(["daily", "weekly", "monthly"] as const).map((t) => (
                            <button key={t} onClick={() => setNewType(t)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg capitalize"
                              style={{
                                background: newType === t ? "var(--bg-hover)" : "transparent",
                                color: newType === t ? "var(--text-primary)" : "var(--text-tertiary)",
                                border: newType === t ? "1px solid var(--border-hover)" : "1px solid transparent",
                              }}>{t}</button>
                          ))}
                        </div>
                      </div>
                      {newType === "weekly" && (
                        <div>
                          <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Days</label>
                          <div className="flex items-center gap-1">
                            {DAY_NAMES.map((name, i) => (
                              <button key={i} onClick={() => toggleDay(i)}
                                className="w-9 h-8 text-[10px] font-medium rounded-lg"
                                style={{
                                  background: newDays.includes(i) ? "var(--accent)" : "transparent",
                                  color: newDays.includes(i) ? "#fff" : "var(--text-tertiary)",
                                  border: newDays.includes(i) ? "none" : "1px solid var(--border-primary)",
                                }}>{name}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {newType === "monthly" && (
                        <div>
                          <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Day of month</label>
                          <input type="number" min={1} max={28} value={newDayOfMonth} onChange={(e) => setNewDayOfMonth(Number(e.target.value))}
                            className="w-20 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                            style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Time</label>
                        <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                          className="w-32 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                          <input type="checkbox" checked={newWebSearch} onChange={(e) => setNewWebSearch(e.target.checked)} className="rounded" /> Web search
                        </label>
                        <select value={newModelId} onChange={(e) => setNewModelId(e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg bg-transparent focus:outline-none"
                          style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                          <option value="oforo-general">Mini</option><option value="oforo-pro">Pro</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={saveSchedule} disabled={!newPrompt.trim()}
                          className="px-4 py-1.5 text-xs font-medium rounded-lg"
                          style={{ background: newPrompt.trim() ? "var(--accent)" : "var(--bg-tertiary)", color: newPrompt.trim() ? "#fff" : "var(--text-tertiary)" }}>
                          {editingId ? "Update" : "Schedule"}</button>
                        <button onClick={resetScheduleForm} className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ color: "var(--text-tertiary)" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Schedule list */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                  {queries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Clock className="w-8 h-8 mb-2" style={{ color: "var(--text-tertiary)", opacity: 0.3 }} />
                      <p className="text-xs text-center" style={{ color: "var(--text-tertiary)" }}>
                        No scheduled queries yet.<br />Create one to automate recurring prompts.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {queries.map((q) => (
                        <div key={q.id} className="group rounded-xl p-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                          <div className="flex items-start gap-2">
                            <button onClick={() => toggleSchedule(q.id)} className="mt-0.5 flex-shrink-0">
                              {q.enabled
                                ? <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}><Check className="w-2.5 h-2.5 text-white" /></div>
                                : <div className="w-4 h-4 rounded-full" style={{ border: "1.5px solid var(--text-tertiary)" }} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${q.enabled ? "" : "opacity-50"}`} style={{ color: "var(--text-primary)" }}>{q.prompt}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--accent)" }}>
                                  <RefreshCw className="w-2.5 h-2.5" /> {getScheduleLabel(q.schedule)}
                                </span>
                                {q.webSearch && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>Web</span>}
                                {q.lastRun && <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Last: {new Date(q.lastRun).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                              </div>
                              {q.nextRun && q.enabled && (
                                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                                  Next: {new Date(q.nextRun).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              )}
                              {q.lastResult && <p className="text-[10px] mt-1 line-clamp-2 italic" style={{ color: "var(--text-tertiary)" }}>&ldquo;{q.lastResult.slice(0, 100)}&rdquo;</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: "1px solid var(--border-primary)" }}>
                            <button onClick={() => runNow(q)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded" style={{ color: "var(--accent)" }}>
                              <Play className="w-3 h-3" /> Run now
                            </button>
                            <button onClick={() => editSchedule(q)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded" style={{ color: "var(--text-tertiary)" }}>
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => deleteSchedule(q.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded ml-auto" style={{ color: "#ef4444" }}>
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    Schedules run while the app is open. Results appear as notifications.
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ═══════ EXPORTED: Parse todos from AI response ═══════ */
export function parseTodosFromAIResponse(content: string): { text: string; dueDate?: string; priority: "low" | "medium" | "high" }[] {
  const todos: { text: string; dueDate?: string; priority: "low" | "medium" | "high" }[] = [];
  const patterns = [/[-*]\s*\[[\sx]?\]\s*(.+)/gi, /TODO:\s*(.+)/gi, /TASK:\s*(.+)/gi, /ACTION:\s*(.+)/gi];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const taskText = match[1].trim();
      if (taskText.length > 2 && taskText.length < 200) {
        let priority: "low" | "medium" | "high" = "medium";
        if (/urgent|critical|important|high/i.test(taskText)) priority = "high";
        if (/low|minor|optional/i.test(taskText)) priority = "low";
        let dueDate: string | undefined;
        const dateMatch = taskText.match(/by\s+(\d{4}-\d{2}-\d{2})/i) || taskText.match(/due\s+(\d{4}-\d{2}-\d{2})/i);
        if (dateMatch) dueDate = dateMatch[1];
        todos.push({ text: taskText, dueDate, priority });
      }
    }
  }
  return todos;
}
