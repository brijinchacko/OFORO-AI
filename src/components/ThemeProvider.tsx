"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* ═══════ THEME DEFINITIONS ═══════
   Each theme has a unique color palette that surprises the user.
   Toggling cycles through them in order. */

interface ThemeColors {
  bgPrimary: string; bgSecondary: string; bgTertiary: string; bgElevated: string;
  bgHover: string; bgInput: string; bgInputFocus: string;
  borderPrimary: string; borderHover: string;
  textPrimary: string; textSecondary: string; textTertiary: string; textInverse: string;
  accent: string; shadowColor: string; logoFilter: string;
  label: string; emoji: string;
}

const themes: Record<string, ThemeColors> = {
  /* ── DARK THEMES ── */
  midnight: {
    bgPrimary: "#000000", bgSecondary: "#0a0a0a", bgTertiary: "#111111", bgElevated: "#1a1a1a",
    bgHover: "rgba(255,255,255,0.05)", bgInput: "#1a1a1a", bgInputFocus: "#222222",
    borderPrimary: "rgba(255,255,255,0.08)", borderHover: "rgba(255,255,255,0.15)",
    textPrimary: "#ffffff", textSecondary: "#a0a0a0", textTertiary: "#666666", textInverse: "#000000",
    accent: "#3b82f6", shadowColor: "rgba(0,0,0,0.5)", logoFilter: "invert(1)",
    label: "Midnight", emoji: "🌙",
  },
  ocean: {
    bgPrimary: "#0a1628", bgSecondary: "#0d1f3c", bgTertiary: "#122a4e", bgElevated: "#163561",
    bgHover: "rgba(56,189,248,0.08)", bgInput: "#122a4e", bgInputFocus: "#163561",
    borderPrimary: "rgba(56,189,248,0.12)", borderHover: "rgba(56,189,248,0.25)",
    textPrimary: "#e0f2fe", textSecondary: "#7dd3fc", textTertiary: "#38bdf8", textInverse: "#0a1628",
    accent: "#0ea5e9", shadowColor: "rgba(0,0,0,0.6)", logoFilter: "invert(1) sepia(1) saturate(5) hue-rotate(175deg)",
    label: "Ocean", emoji: "🌊",
  },
  aurora: {
    bgPrimary: "#0f0a1e", bgSecondary: "#150e2e", bgTertiary: "#1c1240", bgElevated: "#231852",
    bgHover: "rgba(168,85,247,0.08)", bgInput: "#1c1240", bgInputFocus: "#231852",
    borderPrimary: "rgba(168,85,247,0.12)", borderHover: "rgba(168,85,247,0.25)",
    textPrimary: "#f3e8ff", textSecondary: "#c084fc", textTertiary: "#a855f7", textInverse: "#0f0a1e",
    accent: "#a855f7", shadowColor: "rgba(0,0,0,0.6)", logoFilter: "invert(1) sepia(1) saturate(3) hue-rotate(240deg)",
    label: "Aurora", emoji: "🌌",
  },
  ember: {
    bgPrimary: "#1a0a0a", bgSecondary: "#2a0e0e", bgTertiary: "#3a1414", bgElevated: "#4a1a1a",
    bgHover: "rgba(251,146,60,0.08)", bgInput: "#3a1414", bgInputFocus: "#4a1a1a",
    borderPrimary: "rgba(251,146,60,0.12)", borderHover: "rgba(251,146,60,0.25)",
    textPrimary: "#fff7ed", textSecondary: "#fdba74", textTertiary: "#fb923c", textInverse: "#1a0a0a",
    accent: "#f97316", shadowColor: "rgba(0,0,0,0.6)", logoFilter: "invert(1) sepia(1) saturate(5) hue-rotate(15deg)",
    label: "Ember", emoji: "🔥",
  },
  forest: {
    bgPrimary: "#0a1a0e", bgSecondary: "#0e2414", bgTertiary: "#14301c", bgElevated: "#1a3c24",
    bgHover: "rgba(74,222,128,0.08)", bgInput: "#14301c", bgInputFocus: "#1a3c24",
    borderPrimary: "rgba(74,222,128,0.12)", borderHover: "rgba(74,222,128,0.25)",
    textPrimary: "#ecfdf5", textSecondary: "#86efac", textTertiary: "#4ade80", textInverse: "#0a1a0e",
    accent: "#22c55e", shadowColor: "rgba(0,0,0,0.6)", logoFilter: "invert(1) sepia(1) saturate(3) hue-rotate(90deg)",
    label: "Forest", emoji: "🌲",
  },
  /* ── LIGHT THEMES ── */
  snow: {
    bgPrimary: "#ffffff", bgSecondary: "#f8f9fa", bgTertiary: "#f0f1f3", bgElevated: "#ffffff",
    bgHover: "rgba(0,0,0,0.04)", bgInput: "#f0f1f3", bgInputFocus: "#e8e9eb",
    borderPrimary: "rgba(0,0,0,0.08)", borderHover: "rgba(0,0,0,0.15)",
    textPrimary: "#0f0f0f", textSecondary: "#555555", textTertiary: "#999999", textInverse: "#ffffff",
    accent: "#2563eb", shadowColor: "rgba(0,0,0,0.08)", logoFilter: "none",
    label: "Snow", emoji: "❄️",
  },
  peach: {
    bgPrimary: "#fffbf7", bgSecondary: "#fff5ed", bgTertiary: "#ffedd5", bgElevated: "#fffbf7",
    bgHover: "rgba(251,146,60,0.08)", bgInput: "#ffedd5", bgInputFocus: "#fde0c2",
    borderPrimary: "rgba(234,88,12,0.1)", borderHover: "rgba(234,88,12,0.2)",
    textPrimary: "#431407", textSecondary: "#9a3412", textTertiary: "#c2410c", textInverse: "#fffbf7",
    accent: "#ea580c", shadowColor: "rgba(234,88,12,0.08)", logoFilter: "sepia(1) saturate(2) hue-rotate(340deg)",
    label: "Peach", emoji: "🍑",
  },
  lavender: {
    bgPrimary: "#faf8ff", bgSecondary: "#f3f0ff", bgTertiary: "#ede9fe", bgElevated: "#faf8ff",
    bgHover: "rgba(139,92,246,0.06)", bgInput: "#ede9fe", bgInputFocus: "#e2dcfc",
    borderPrimary: "rgba(139,92,246,0.1)", borderHover: "rgba(139,92,246,0.2)",
    textPrimary: "#2e1065", textSecondary: "#6d28d9", textTertiary: "#8b5cf6", textInverse: "#faf8ff",
    accent: "#7c3aed", shadowColor: "rgba(139,92,246,0.08)", logoFilter: "sepia(1) saturate(3) hue-rotate(240deg)",
    label: "Lavender", emoji: "💜",
  },
  mint: {
    bgPrimary: "#f0fdfa", bgSecondary: "#e6faf5", bgTertiary: "#ccfbf1", bgElevated: "#f0fdfa",
    bgHover: "rgba(20,184,166,0.06)", bgInput: "#ccfbf1", bgInputFocus: "#bef5ee",
    borderPrimary: "rgba(20,184,166,0.1)", borderHover: "rgba(20,184,166,0.2)",
    textPrimary: "#134e4a", textSecondary: "#0f766e", textTertiary: "#14b8a6", textInverse: "#f0fdfa",
    accent: "#0d9488", shadowColor: "rgba(20,184,166,0.08)", logoFilter: "sepia(1) saturate(3) hue-rotate(130deg)",
    label: "Mint", emoji: "🌿",
  },
  rose: {
    bgPrimary: "#fff5f7", bgSecondary: "#ffe4e9", bgTertiary: "#fecdd3", bgElevated: "#fff5f7",
    bgHover: "rgba(244,63,94,0.06)", bgInput: "#fecdd3", bgInputFocus: "#fda4af",
    borderPrimary: "rgba(244,63,94,0.1)", borderHover: "rgba(244,63,94,0.2)",
    textPrimary: "#4c0519", textSecondary: "#be123c", textTertiary: "#f43f5e", textInverse: "#fff5f7",
    accent: "#e11d48", shadowColor: "rgba(244,63,94,0.08)", logoFilter: "sepia(1) saturate(3) hue-rotate(320deg)",
    label: "Rose", emoji: "🌹",
  },
  rainbow: {
    bgPrimary: "#1a1025", bgSecondary: "#221335", bgTertiary: "#2a1845", bgElevated: "#321d55",
    bgHover: "rgba(236,72,153,0.08)", bgInput: "#2a1845", bgInputFocus: "#321d55",
    borderPrimary: "rgba(236,72,153,0.12)", borderHover: "rgba(168,85,247,0.25)",
    textPrimary: "#fce7f3", textSecondary: "#f9a8d4", textTertiary: "#ec4899", textInverse: "#1a1025",
    accent: "#ec4899", shadowColor: "rgba(0,0,0,0.6)", logoFilter: "invert(1) sepia(1) saturate(5) hue-rotate(280deg)",
    label: "Rainbow", emoji: "🌈",
  },
};

const themeOrder = ["midnight", "ocean", "aurora", "ember", "forest", "rainbow", "snow", "peach", "lavender", "mint", "rose"];

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  themeLabel: string;
  themeEmoji: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  themeName: "midnight",
  themeLabel: "Midnight",
  themeEmoji: "🌙",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyThemeVars(name: string) {
  const t = themes[name];
  if (!t) return;
  const root = document.documentElement;
  root.style.setProperty("--bg-primary", t.bgPrimary);
  root.style.setProperty("--bg-secondary", t.bgSecondary);
  root.style.setProperty("--bg-tertiary", t.bgTertiary);
  root.style.setProperty("--bg-elevated", t.bgElevated);
  root.style.setProperty("--bg-hover", t.bgHover);
  root.style.setProperty("--bg-input", t.bgInput);
  root.style.setProperty("--bg-input-focus", t.bgInputFocus);
  root.style.setProperty("--border-primary", t.borderPrimary);
  root.style.setProperty("--border-hover", t.borderHover);
  root.style.setProperty("--text-primary", t.textPrimary);
  root.style.setProperty("--text-secondary", t.textSecondary);
  root.style.setProperty("--text-tertiary", t.textTertiary);
  root.style.setProperty("--text-inverse", t.textInverse);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--shadow-color", t.shadowColor);
  root.style.setProperty("--logo-filter", t.logoFilter);

  // Determine if dark or light for class toggling
  const isDark = ["midnight", "ocean", "aurora", "ember", "forest", "rainbow"].includes(name);
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState("midnight");
  const [mounted, setMounted] = useState(false);

  const isDark = ["midnight", "ocean", "aurora", "ember", "forest"].includes(themeName);
  const theme: Theme = isDark ? "dark" : "light";
  const themeData = themes[themeName] || themes.midnight;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("oforo-theme-name");
    if (saved && themes[saved]) {
      setThemeName(saved);
      applyThemeVars(saved);
    } else {
      applyThemeVars("midnight");
    }
  }, []);

  function toggleTheme() {
    const currentIndex = themeOrder.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextName = themeOrder[nextIndex];
    setThemeName(nextName);
    localStorage.setItem("oforo-theme-name", nextName);
    applyThemeVars(nextName);
  }

  if (!mounted) {
    return <div className="bg-black min-h-screen" />;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, themeLabel: themeData.label, themeEmoji: themeData.emoji, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
