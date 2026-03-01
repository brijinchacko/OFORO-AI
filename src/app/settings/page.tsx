"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { usePlan, PlanTier } from "@/components/PlanProvider";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Eye,
  Palette,
  Trash2,
  ChevronRight,
  ChevronDown,
  Check,
  Settings,
  CreditCard,
  BarChart3,
  Plug,
  Calendar,
  CheckSquare,
  Mail,
  Cloud,
  HardDrive,
  Clock,
  FileText,
  Crown,
  Zap,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Ticket,
  Brain,
  Sparkles,
} from "lucide-react";

/* ── Tab type ── */
type SettingsTab = "general" | "account" | "billing" | "usage" | "connectors";

/* ── Avatar generator ── */
const avatarStyles = [
  { id: "initials", label: "Initials", colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#22c55e", "#06b6d4", "#ef4444", "#eab308"] },
  { id: "gradient1", label: "Sunset", gradient: "linear-gradient(135deg, #f97316, #ec4899)" },
  { id: "gradient2", label: "Ocean", gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { id: "gradient3", label: "Aurora", gradient: "linear-gradient(135deg, #8b5cf6, #06b6d4)" },
  { id: "gradient4", label: "Forest", gradient: "linear-gradient(135deg, #22c55e, #06b6d4)" },
  { id: "gradient5", label: "Rose", gradient: "linear-gradient(135deg, #ec4899, #ef4444)" },
  { id: "gradient6", label: "Ember", gradient: "linear-gradient(135deg, #f97316, #ef4444)" },
  { id: "gradient7", label: "Lavender", gradient: "linear-gradient(135deg, #a855f7, #ec4899)" },
  { id: "gradient8", label: "Mint", gradient: "linear-gradient(135deg, #14b8a6, #22c55e)" },
];

function AvatarPreview({ style, name, size = 48 }: { style: string; name: string; size?: number }) {
  const avatarDef = avatarStyles.find((a) => a.id === style);
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  if (style === "initials") {
    const colorIdx = name ? name.charCodeAt(0) % (avatarDef?.colors?.length || 8) : 0;
    const bgColor = avatarDef?.colors?.[colorIdx] || "#3b82f6";
    return (
      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
        style={{ width: size, height: size, background: bgColor, fontSize: size * 0.4 }}>{initial}</div>
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: avatarDef?.gradient || "#3b82f6", fontSize: size * 0.4 }}>{initial}</div>
  );
}

/* ── Toggle ── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors duration-200"
      style={{ background: on ? "var(--accent)" : "var(--bg-hover)" }}>
      <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

/* ── Connector interface ── */
interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "calendar" | "tasks" | "email" | "storage" | "productivity";
  connected: boolean;
  lastSync?: string;
  accountLabel?: string;
}

/* ═══════ SETTINGS PAGE ═══════ */
export default function SettingsPage() {
  const { theme, themeName, themeLabel, themeEmoji, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { plan, planInfo, applyCoupon, setPlan } = usePlan();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [notifications, setNotifications] = useState(true);
  const [searchHistory, setSearchHistory] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);
  const [defaultModel, setDefaultModel] = useState("oforo-general");
  const [language, setLanguage] = useState("en");
  const [avatarStyle, setAvatarStyle] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("oforo-avatar-style") || "initials";
    return "initials";
  });

  // Account
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [accountSaved, setAccountSaved] = useState(false);

  // Billing
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Connectors
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: "outlook-calendar",
      name: "Outlook Calendar",
      description: "Sync your Outlook calendar events, meetings, and schedules",
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      category: "calendar",
      connected: false,
    },
    {
      id: "apple-reminders",
      name: "Apple Reminders",
      description: "Sync your Apple Reminders lists and tasks",
      icon: <CheckSquare className="w-5 h-5 text-orange-500" />,
      category: "tasks",
      connected: false,
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your Google Calendar events and schedules",
      icon: <Calendar className="w-5 h-5 text-green-500" />,
      category: "calendar",
      connected: false,
    },
    {
      id: "microsoft-todo",
      name: "Microsoft To Do",
      description: "Sync your Microsoft To Do tasks and lists",
      icon: <CheckSquare className="w-5 h-5 text-blue-400" />,
      category: "tasks",
      connected: false,
    },
    {
      id: "outlook-mail",
      name: "Outlook Mail",
      description: "Access your Outlook email, compose and read messages",
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      category: "email",
      connected: false,
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Access your Gmail inbox, compose and read messages",
      icon: <Mail className="w-5 h-5 text-red-500" />,
      category: "email",
      connected: false,
    },
    {
      id: "onedrive",
      name: "OneDrive",
      description: "Access and manage your OneDrive files and documents",
      icon: <Cloud className="w-5 h-5 text-blue-500" />,
      category: "storage",
      connected: false,
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Access and manage your Google Drive files",
      icon: <HardDrive className="w-5 h-5 text-yellow-500" />,
      category: "storage",
      connected: false,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Sync your Notion workspaces, pages, and databases",
      icon: <FileText className="w-5 h-5" style={{ color: "var(--text-primary)" }} />,
      category: "productivity",
      connected: false,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Connect your Slack workspace for messaging and notifications",
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      category: "productivity",
      connected: false,
    },
    {
      id: "trello",
      name: "Trello",
      description: "Sync your Trello boards, lists, and cards",
      icon: <CheckSquare className="w-5 h-5 text-sky-500" />,
      category: "productivity",
      connected: false,
    },
    {
      id: "jira",
      name: "Jira",
      description: "Connect your Jira projects, issues, and sprints",
      icon: <AlertTriangle className="w-5 h-5 text-blue-500" />,
      category: "productivity",
      connected: false,
    },
  ]);

  // Load connectors from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oforo-connectors");
      if (saved) {
        const savedState = JSON.parse(saved) as Record<string, { connected: boolean; lastSync?: string; accountLabel?: string }>;
        setConnectors((prev) =>
          prev.map((c) => savedState[c.id] ? { ...c, ...savedState[c.id] } : c)
        );
      }
    } catch { /* ignore */ }
  }, []);

  // Usage stats
  const [usageStats] = useState(() => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    return {
      messagesUsed: Math.floor(Math.random() * 800) + 200,
      messagesLimit: plan === "free" ? 50 * 30 : -1,
      tokensUsed: Math.floor(Math.random() * 500000) + 50000,
      apiCalls: Math.floor(Math.random() * 200) + 20,
      storageUsed: Math.floor(Math.random() * 500) + 50,
      storageLimit: plan === "free" ? 500 : plan === "pro" ? 5000 : 50000,
      daysInPeriod: daysInMonth,
      dayOfPeriod: dayOfMonth,
    };
  });

  const toggleConnector = useCallback((id: string) => {
    setConnectors((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== id) return c;
        const newConnected = !c.connected;
        return {
          ...c,
          connected: newConnected,
          lastSync: newConnected ? new Date().toISOString() : undefined,
          accountLabel: newConnected ? (user?.email || "Connected") : undefined,
        };
      });
      // Save to localStorage
      const state: Record<string, { connected: boolean; lastSync?: string; accountLabel?: string }> = {};
      updated.forEach((c) => { state[c.id] = { connected: c.connected, lastSync: c.lastSync, accountLabel: c.accountLabel }; });
      localStorage.setItem("oforo-connectors", JSON.stringify(state));
      return updated;
    });
  }, [user?.email]);

  const handleApplyCoupon = () => {
    setCouponMsg(null);
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponMsg({ type: "success", text: `Coupon applied! You now have the ${result.plan === "max" ? "MAX" : "Pro"} plan.` });
      setCouponInput("");
    } else {
      setCouponMsg({ type: "error", text: result.error || "Invalid coupon" });
    }
  };

  const handleSaveAccount = () => {
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 2000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Settings className="w-4 h-4" /> },
    { id: "account", label: "Account", icon: <User className="w-4 h-4" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
    { id: "usage", label: "Usage", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "connectors", label: "Connectors", icon: <Plug className="w-4 h-4" /> },
  ];

  const planColors: Record<PlanTier, { bg: string; text: string; border: string }> = {
    free: { bg: "var(--bg-hover)", text: "var(--text-tertiary)", border: "var(--border-primary)" },
    pro: { bg: "rgba(168,85,247,0.1)", text: "#a855f7", border: "rgba(168,85,247,0.3)" },
    max: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  };

  const planLabels: Record<PlanTier, string> = { free: "Mini (Free)", pro: "Pro", max: "MAX" };
  const planPrices: Record<PlanTier, string> = { free: "Free", pro: "£14.99/mo", max: "£89.99/mo" };

  const connectorCategories = [
    { id: "calendar" as const, label: "Calendars" },
    { id: "tasks" as const, label: "Tasks" },
    { id: "email" as const, label: "Email" },
    { id: "storage" as const, label: "Cloud Storage" },
    { id: "productivity" as const, label: "Productivity" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all rounded-t-lg"
              style={{
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-tertiary)",
                borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                background: activeTab === tab.id ? "var(--bg-secondary)" : "transparent",
              }}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ GENERAL TAB ═══ */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Appearance */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Appearance</h2>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <button onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5" style={{ color: "var(--accent)" }} />
                    <div>
                      <p className="text-sm font-medium">Theme</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Click to surprise yourself with a new look</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{themeEmoji} {themeLabel}</span>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                  </div>
                </button>
              </div>
            </section>

            {/* Default model */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Default Model</h2>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <select value={defaultModel} onChange={(e) => { setDefaultModel(e.target.value); localStorage.setItem("oforo-default-model", e.target.value); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
                  <option value="oforo-general">Oforo Mini (Default)</option>
                  <option value="oforo-pro">Oforo Pro</option>
                  <option value="oforo-max">Oforo MAX</option>
                </select>
                <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>This model will be selected when you start a new chat.</p>
              </div>
            </section>

            {/* Language */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Language</h2>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                  <option value="ar">العربية</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </section>

            {/* Preferences */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Preferences</h2>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-sm font-medium">Notifications</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Get notified about updates</p>
                    </div>
                  </div>
                  <Toggle on={notifications} onToggle={() => setNotifications(!notifications)} />
                </div>
                <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-sm font-medium">Search History</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Save your chat history locally</p>
                    </div>
                  </div>
                  <Toggle on={searchHistory} onToggle={() => setSearchHistory(!searchHistory)} />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-sm font-medium">Data Collection</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Help improve Oforo with anonymous usage data</p>
                    </div>
                  </div>
                  <Toggle on={dataCollection} onToggle={() => setDataCollection(!dataCollection)} />
                </div>
              </div>
            </section>

            {/* Danger zone */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Data</h2>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <button onClick={() => {
                  if (confirm("Are you sure you want to delete all chats and preferences? This cannot be undone.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                  className="w-full flex items-center gap-3 p-4 text-left text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Clear All Data</p>
                    <p className="text-xs opacity-70">Delete all chats, preferences, and local data</p>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ═══ ACCOUNT TAB ═══ */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Profile */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Profile</h2>
              <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center gap-4 mb-5">
                  <AvatarPreview style={avatarStyle} name={user?.name || "Guest"} size={64} />
                  <div>
                    <p className="font-semibold text-lg">{user?.name || "Guest User"}</p>
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>{user?.email || "Not signed in"}</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold rounded"
                      style={{ background: planColors[plan].bg, color: planColors[plan].text, border: `1px solid ${planColors[plan].border}` }}>
                      {plan === "max" ? <Crown className="w-3 h-3" /> : plan === "pro" ? <Brain className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      {planLabels[plan]} Plan
                    </span>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-tertiary)" }}>Display Name</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-tertiary)" }}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }} />
                  </div>
                  <button onClick={handleSaveAccount}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-white"
                    style={{ background: accountSaved ? "#22c55e" : "var(--accent)" }}>
                    {accountSaved ? <><Check className="w-4 h-4" /> Saved</> : "Save Changes"}
                  </button>
                </div>
              </div>
            </section>

            {/* Avatar picker */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Avatar Style</h2>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex flex-wrap gap-2">
                  {avatarStyles.map((a) => (
                    <button key={a.id}
                      onClick={() => { setAvatarStyle(a.id); localStorage.setItem("oforo-avatar-style", a.id); }}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                      style={{
                        border: avatarStyle === a.id ? "2px solid var(--accent)" : "2px solid transparent",
                        background: avatarStyle === a.id ? "var(--bg-hover)" : "transparent",
                      }}>
                      <AvatarPreview style={a.id} name={user?.name || "Guest"} size={36} />
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Password */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Security</h2>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <button className="w-full flex items-center justify-between p-4 text-left transition-colors"
                  style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-sm font-medium">Change Password</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Update your account password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                </button>
                <button className="w-full flex items-center justify-between p-4 text-left transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Add extra security to your account</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)" }}>Off</span>
                </button>
              </div>
            </section>

            {/* Delete account */}
            <section>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <button className="w-full flex items-center gap-3 p-4 text-left text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs opacity-70">Permanently delete your account and all data</p>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ═══ BILLING TAB ═══ */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Current plan */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Current Plan</h2>
              <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary)", border: `1px solid ${planColors[plan].border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: planColors[plan].bg }}>
                      {plan === "max" ? <Crown className="w-5 h-5" style={{ color: planColors[plan].text }} /> :
                       plan === "pro" ? <Brain className="w-5 h-5" style={{ color: planColors[plan].text }} /> :
                       <Sparkles className="w-5 h-5" style={{ color: planColors[plan].text }} />}
                    </div>
                    <div>
                      <p className="font-semibold">{planLabels[plan]}</p>
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>{planPrices[plan]}</p>
                    </div>
                  </div>
                  <Link href="/pricing" className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                    {plan === "max" ? "View Plans" : "Upgrade"}
                  </Link>
                </div>
                {planInfo.couponUsed && (
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Activated with coupon: <span className="font-mono font-medium">{planInfo.couponUsed}</span>
                  </p>
                )}
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Active since {new Date(planInfo.activatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </section>

            {/* Coupon code */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Coupon Code</h2>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  <p className="text-sm font-medium">Apply a coupon code</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponMsg(null); }}
                    placeholder="e.g. OFORO-PRO-TEST"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
                    onKeyDown={(e) => e.key === "Enter" && couponInput.trim() && handleApplyCoupon()} />
                  <button onClick={handleApplyCoupon} disabled={!couponInput.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white"
                    style={{ background: couponInput.trim() ? "var(--accent)" : "var(--bg-hover)", opacity: couponInput.trim() ? 1 : 0.5 }}>
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-xs mt-2 ${couponMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{couponMsg.text}</p>
                )}
              </div>
            </section>

            {/* Payment method */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Payment Method</h2>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" style={{ color: "var(--text-tertiary)" }} />
                    <div>
                      <p className="text-sm font-medium">Payment card</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No card on file</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ border: "1px solid var(--border-primary)", color: "var(--text-tertiary)" }}>
                    Add card
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Billing cycle: Monthly &middot; Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </section>

            {/* Billing history */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Billing History</h2>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                {plan === "free" ? (
                  <div className="p-6 text-center">
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No billing history on the free plan.</p>
                    <Link href="/pricing" className="text-sm mt-2 inline-block" style={{ color: "var(--accent)" }}>Upgrade to Pro or MAX</Link>
                  </div>
                ) : (
                  <div>
                    {[
                      { date: "1 Mar 2026", amount: plan === "max" ? "£89.99" : "£14.99", status: "Paid", invoice: "INV-2026-003" },
                      { date: "1 Feb 2026", amount: plan === "max" ? "£89.99" : "£14.99", status: "Paid", invoice: "INV-2026-002" },
                      { date: "1 Jan 2026", amount: plan === "max" ? "£89.99" : "£14.99", status: "Paid", invoice: "INV-2026-001" },
                    ].map((inv) => (
                      <div key={inv.invoice} className="flex items-center justify-between p-4"
                        style={{ borderBottom: "1px solid var(--border-primary)" }}>
                        <div>
                          <p className="text-sm font-medium">{inv.amount}</p>
                          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{inv.date} &middot; {inv.invoice}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded text-emerald-400" style={{ background: "rgba(34,197,94,0.1)" }}>{inv.status}</span>
                          <button className="p-1 rounded" style={{ color: "var(--text-tertiary)" }}><ExternalLink className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ═══ USAGE TAB ═══ */}
        {activeTab === "usage" && (
          <div className="space-y-6">
            {/* Overview */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>This Month</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Messages",
                    value: usageStats.messagesUsed.toLocaleString(),
                    sub: usageStats.messagesLimit > 0 ? `of ${usageStats.messagesLimit.toLocaleString()} limit` : "Unlimited",
                    pct: usageStats.messagesLimit > 0 ? Math.min((usageStats.messagesUsed / usageStats.messagesLimit) * 100, 100) : -1,
                    color: "#3b82f6",
                  },
                  {
                    label: "Tokens Used",
                    value: `${(usageStats.tokensUsed / 1000).toFixed(0)}K`,
                    sub: "tokens processed",
                    pct: -1,
                    color: "#8b5cf6",
                  },
                  {
                    label: "API Calls",
                    value: usageStats.apiCalls.toLocaleString(),
                    sub: "requests made",
                    pct: -1,
                    color: "#06b6d4",
                  },
                  {
                    label: "Storage",
                    value: `${usageStats.storageUsed} MB`,
                    sub: `of ${usageStats.storageLimit >= 1000 ? `${(usageStats.storageLimit / 1000).toFixed(0)} GB` : `${usageStats.storageLimit} MB`} limit`,
                    pct: Math.min((usageStats.storageUsed / usageStats.storageLimit) * 100, 100),
                    color: "#f59e0b",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>{stat.label}</p>
                    <p className="text-2xl font-bold mb-0.5">{stat.value}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{stat.sub}</p>
                    {stat.pct >= 0 && (
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-hover)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${stat.pct}%`, background: stat.color }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Daily usage chart (simplified) */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Daily Activity</h2>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-end gap-1 h-24">
                  {Array.from({ length: 14 }, (_, i) => {
                    const h = Math.random() * 80 + 10;
                    const isToday = i === 13;
                    return (
                      <div key={i} className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${h}%`,
                          background: isToday ? "var(--accent)" : "var(--bg-hover)",
                          opacity: isToday ? 1 : 0.6,
                        }} />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>14 days ago</span>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Today</span>
                </div>
              </div>
            </section>

            {/* Model usage breakdown */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Model Usage</h2>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                {[
                  { name: "Oforo Mini", pct: 45, color: "#3b82f6" },
                  { name: "Oforo Pro", pct: 30, color: "#a855f7" },
                  { name: "Oforo MAX", pct: 15, color: "#f59e0b" },
                  { name: "LADX AI", pct: 5, color: "#06b6d4" },
                  { name: "SEEKOF AI", pct: 3, color: "#8b5cf6" },
                  { name: "NXTED AI", pct: 2, color: "#22c55e" },
                ].map((m) => (
                  <div key={m.name} className="flex items-center gap-3 p-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    <span className="text-sm flex-1">{m.name}</span>
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-hover)" }}>
                      <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: "var(--text-tertiary)" }}>{m.pct}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ═══ CONNECTORS TAB ═══ */}
        {activeTab === "connectors" && (
          <div className="space-y-6">
            <div className="rounded-xl p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Plug className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <p className="text-sm font-medium">Connect your apps</p>
              </div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Link your favourite tools and services to enhance your Oforo AI experience. Connected apps sync automatically.
              </p>
            </div>

            {connectorCategories.map((cat) => {
              const catConnectors = connectors.filter((c) => c.category === cat.id);
              if (catConnectors.length === 0) return null;
              return (
                <section key={cat.id}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>{cat.label}</h2>
                  <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                    {catConnectors.map((connector, idx) => (
                      <div key={connector.id}
                        className="flex items-center gap-3 p-4"
                        style={{ borderBottom: idx < catConnectors.length - 1 ? "1px solid var(--border-primary)" : "none" }}>
                        <div className="flex-shrink-0">{connector.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{connector.name}</p>
                            {connector.connected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded text-emerald-400 font-medium"
                                style={{ background: "rgba(34,197,94,0.1)" }}>Connected</span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            {connector.connected && connector.accountLabel
                              ? `${connector.accountLabel} • Last synced ${connector.lastSync ? new Date(connector.lastSync).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "just now"}`
                              : connector.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {connector.connected && (
                            <button onClick={() => toggleConnector(connector.id)}
                              className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
                              title="Sync now">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => toggleConnector(connector.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={connector.connected
                              ? { border: "1px solid var(--border-primary)", color: "var(--text-tertiary)" }
                              : { background: "var(--accent)", color: "white" }
                            }>
                            {connector.connected ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <p className="text-center text-[11px] mt-10" style={{ color: "var(--text-tertiary)" }}>&copy; {new Date().getFullYear()} Oforo Ltd &middot; A Wartens Company</p>
      </div>
    </div>
  );
}
