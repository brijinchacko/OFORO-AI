"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Plus, Check, Clock, Calendar, Trash2,
  Play, Pause, ChevronDown, ChevronRight, RefreshCw,
  AlertCircle, Zap, Edit3,
} from "lucide-react";

/* ═══════ TYPES ═══════ */
interface ScheduledQuery {
  id: string;
  prompt: string;
  schedule: ScheduleConfig;
  enabled: boolean;
  lastRun?: string;       // ISO date
  lastResult?: string;    // Last AI response snippet
  nextRun?: string;       // ISO date
  createdAt: string;
  webSearch: boolean;
  modelId: string;
}

interface ScheduleConfig {
  type: "daily" | "weekly" | "monthly" | "custom";
  time: string;           // HH:mm
  daysOfWeek?: number[];  // 0=Sun, 1=Mon, ...
  dayOfMonth?: number;
  intervalMinutes?: number; // for custom
}

interface ScheduledQueriesProps {
  isOpen: boolean;
  onClose: () => void;
  onRunQuery: (prompt: string, modelId: string, webSearch: boolean) => void;
}

/* ═══════ HELPERS ═══════ */
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
    // Next week
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

  // Custom interval
  if (s.type === "custom" && s.intervalMinutes) {
    return new Date(now.getTime() + s.intervalMinutes * 60 * 1000);
  }

  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

/* ═══════ NOTIFICATION COMPONENT ═══════ */
export function ScheduledQueryNotification({ query, onDismiss, onView }: {
  query: ScheduledQuery;
  onDismiss: () => void;
  onView: () => void;
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

/* ═══════ MAIN COMPONENT ═══════ */
export default function ScheduledQueries({ isOpen, onClose, onRunQuery }: ScheduledQueriesProps) {
  const [queries, setQueries] = useState<ScheduledQuery[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [newPrompt, setNewPrompt] = useState("");
  const [newType, setNewType] = useState<ScheduleConfig["type"]>("weekly");
  const [newTime, setNewTime] = useState("09:00");
  const [newDays, setNewDays] = useState<number[]>([1]); // Monday
  const [newDayOfMonth, setNewDayOfMonth] = useState(1);
  const [newWebSearch, setNewWebSearch] = useState(true);
  const [newModelId, setNewModelId] = useState("oforo-general");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("oforo-scheduled-queries");
    if (saved) {
      try { setQueries(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("oforo-scheduled-queries", JSON.stringify(queries));
  }, [queries]);

  // ── Scheduler: check every minute if any query should run ──
  useEffect(() => {
    function checkSchedules() {
      const now = new Date();
      setQueries((prev) =>
        prev.map((q) => {
          if (!q.enabled || !q.nextRun) return q;
          const nextRunDate = new Date(q.nextRun);
          if (now >= nextRunDate) {
            // Time to run!
            onRunQuery(q.prompt, q.modelId, q.webSearch);
            return {
              ...q,
              lastRun: now.toISOString(),
              nextRun: getNextRunDate(q.schedule).toISOString(),
            };
          }
          return q;
        })
      );
    }

    const interval = setInterval(checkSchedules, 60 * 1000);
    return () => clearInterval(interval);
  }, [onRunQuery]);

  function saveQuery() {
    if (!newPrompt.trim()) return;

    const schedule: ScheduleConfig = {
      type: newType,
      time: newTime,
      daysOfWeek: newType === "weekly" ? newDays : undefined,
      dayOfMonth: newType === "monthly" ? newDayOfMonth : undefined,
    };

    if (editingId) {
      setQueries((prev) => prev.map((q) =>
        q.id === editingId
          ? { ...q, prompt: newPrompt.trim(), schedule, webSearch: newWebSearch, modelId: newModelId, nextRun: getNextRunDate(schedule).toISOString() }
          : q
      ));
      setEditingId(null);
    } else {
      const newQuery: ScheduledQuery = {
        id: Date.now().toString(),
        prompt: newPrompt.trim(),
        schedule,
        enabled: true,
        nextRun: getNextRunDate(schedule).toISOString(),
        createdAt: new Date().toISOString(),
        webSearch: newWebSearch,
        modelId: newModelId,
      };
      setQueries((prev) => [newQuery, ...prev]);
    }

    resetForm();
  }

  function resetForm() {
    setNewPrompt("");
    setNewType("weekly");
    setNewTime("09:00");
    setNewDays([1]);
    setNewDayOfMonth(1);
    setNewWebSearch(true);
    setNewModelId("oforo-general");
    setShowAddForm(false);
    setEditingId(null);
  }

  function editQuery(q: ScheduledQuery) {
    setEditingId(q.id);
    setNewPrompt(q.prompt);
    setNewType(q.schedule.type);
    setNewTime(q.schedule.time);
    setNewDays(q.schedule.daysOfWeek || [1]);
    setNewDayOfMonth(q.schedule.dayOfMonth || 1);
    setNewWebSearch(q.webSearch);
    setNewModelId(q.modelId);
    setShowAddForm(true);
  }

  function deleteQuery(id: string) {
    setQueries((prev) => prev.filter((q) => q.id !== id));
  }

  function toggleQuery(id: string) {
    setQueries((prev) => prev.map((q) =>
      q.id === id ? { ...q, enabled: !q.enabled } : q
    ));
  }

  function toggleDay(day: number) {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function runNow(q: ScheduledQuery) {
    onRunQuery(q.prompt, q.modelId, q.webSearch);
    setQueries((prev) => prev.map((sq) =>
      sq.id === q.id ? { ...sq, lastRun: new Date().toISOString() } : sq
    ));
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[70]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[420px] max-w-full z-[75] flex flex-col animate-slide-in-right"
        style={{ background: "var(--bg-primary)", borderLeft: "1px solid var(--border-primary)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: "var(--accent)" }} />
              Scheduled Queries
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {queries.filter((q) => q.enabled).length} active schedule{queries.filter((q) => q.enabled).length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add / edit form */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          {!showAddForm ? (
            <button onClick={() => { setShowAddForm(true); setTimeout(() => inputRef.current?.focus(), 100); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors"
              style={{ border: "1px dashed var(--border-primary)", color: "var(--text-tertiary)" }}>
              <Plus className="w-4 h-4" /> Schedule a recurring prompt
            </button>
          ) : (
            <div className="space-y-3">
              {/* Prompt */}
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Prompt</label>
                <input ref={inputRef} type="text" value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g. Summarise this week's tech news"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-transparent focus:outline-none"
                  style={{ border: "1px solid var(--border-hover)", color: "var(--text-primary)" }} />
              </div>

              {/* Frequency */}
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Frequency</label>
                <div className="flex items-center gap-1">
                  {(["daily", "weekly", "monthly"] as const).map((t) => (
                    <button key={t} onClick={() => setNewType(t)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize"
                      style={{
                        background: newType === t ? "var(--bg-hover)" : "transparent",
                        color: newType === t ? "var(--text-primary)" : "var(--text-tertiary)",
                        border: newType === t ? "1px solid var(--border-hover)" : "1px solid transparent",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day selector for weekly */}
              {newType === "weekly" && (
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Days</label>
                  <div className="flex items-center gap-1">
                    {DAY_NAMES.map((name, i) => (
                      <button key={i} onClick={() => toggleDay(i)}
                        className="w-9 h-8 text-[10px] font-medium rounded-lg transition-all"
                        style={{
                          background: newDays.includes(i) ? "var(--accent)" : "transparent",
                          color: newDays.includes(i) ? "#fff" : "var(--text-tertiary)",
                          border: newDays.includes(i) ? "none" : "1px solid var(--border-primary)",
                        }}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Day of month for monthly */}
              {newType === "monthly" && (
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Day of month</label>
                  <input type="number" min={1} max={28} value={newDayOfMonth} onChange={(e) => setNewDayOfMonth(Number(e.target.value))}
                    className="w-20 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                    style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
                </div>
              )}

              {/* Time */}
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-tertiary)" }}>Time</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                  className="w-32 px-2 py-1.5 text-xs rounded-lg bg-transparent focus:outline-none"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }} />
              </div>

              {/* Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                  <input type="checkbox" checked={newWebSearch} onChange={(e) => setNewWebSearch(e.target.checked)}
                    className="rounded" />
                  Web search
                </label>
                <select value={newModelId} onChange={(e) => setNewModelId(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg bg-transparent focus:outline-none"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                  <option value="oforo-general">General</option>
                  <option value="oforo-pro">Pro</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={saveQuery} disabled={!newPrompt.trim()}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{ background: newPrompt.trim() ? "var(--accent)" : "var(--bg-tertiary)", color: newPrompt.trim() ? "#fff" : "var(--text-tertiary)" }}>
                  {editingId ? "Update" : "Schedule"}
                </button>
                <button onClick={resetForm}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{ color: "var(--text-tertiary)" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Query list */}
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
                <div key={q.id}
                  className="group rounded-xl p-3 transition-colors"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                  <div className="flex items-start gap-2">
                    <button onClick={() => toggleQuery(q.id)} className="mt-0.5 flex-shrink-0">
                      {q.enabled ? (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full" style={{ border: "1.5px solid var(--text-tertiary)" }} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${q.enabled ? "" : "opacity-50"}`} style={{ color: "var(--text-primary)" }}>
                        {q.prompt}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--accent)" }}>
                          <RefreshCw className="w-2.5 h-2.5" /> {getScheduleLabel(q.schedule)}
                        </span>
                        {q.webSearch && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                            Web
                          </span>
                        )}
                        {q.lastRun && (
                          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                            Last: {new Date(q.lastRun).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      {q.nextRun && q.enabled && (
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                          Next: {new Date(q.nextRun).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {q.lastResult && (
                        <p className="text-[10px] mt-1 line-clamp-2 italic" style={{ color: "var(--text-tertiary)" }}>
                          &ldquo;{q.lastResult.slice(0, 100)}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: "1px solid var(--border-primary)" }}>
                    <button onClick={() => runNow(q)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors"
                      style={{ color: "var(--accent)" }}>
                      <Play className="w-3 h-3" /> Run now
                    </button>
                    <button onClick={() => editQuery(q)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors"
                      style={{ color: "var(--text-tertiary)" }}>
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => deleteQuery(q.id)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ml-auto"
                      style={{ color: "#ef4444" }}>
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            Schedules run while the app is open. Results appear as new conversations.
          </p>
        </div>
      </div>
    </>
  );
}
