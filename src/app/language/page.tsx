"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowLeft, Check, Search } from "lucide-react";

const languages = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", native: "Svenska", flag: "🇸🇪" },
  { code: "da", name: "Danish", native: "Dansk", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", native: "Norsk", flag: "🇳🇴" },
];

export default function LanguagePage() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState("en");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("oforo-language");
    if (savedLang) setSelected(savedLang);
  }, []);

  function handleSelect(code: string) {
    setSelected(code);
    localStorage.setItem("oforo-language", code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const filtered = languages.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Language</h1>
          {saved && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-500 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
        <p className="text-sm mb-6 ml-12" style={{ color: "var(--text-tertiary)" }}>Choose the language for the Oforo interface and AI responses</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-transparent focus:outline-none"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
          />
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
          {filtered.map((lang, idx) => (
            <button key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full flex items-center gap-4 p-4 text-left transition-colors"
              style={{
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-primary)" : "none",
                background: selected === lang.code ? "var(--bg-hover)" : "transparent",
              }}>
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{lang.name}</p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{lang.native}</p>
              </div>
              {selected === lang.code && <Check className="w-5 h-5" style={{ color: "var(--accent)" }} />}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Language settings affect the Oforo interface. AI responses will try to match your selected language, but may occasionally respond in English for technical content.
          </p>
        </div>

        <p className="text-center text-[11px] mt-10" style={{ color: "var(--text-tertiary)" }}>&copy; {new Date().getFullYear()} Oforo Ltd &middot; A Wartens Company</p>
      </div>
    </div>
  );
}
