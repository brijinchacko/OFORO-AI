"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
  Zap,
  Globe,
  Shield,
  CreditCard,
  Users,
  Mail,
  ExternalLink,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const faqs: FAQ[] = [
  { category: "Getting Started", q: "What is Oforo AI?", a: "Oforo AI is an intelligent search and AI assistant platform built by Oforo Ltd, a Wartens company based in Milton Keynes, UK. We offer general AI chat, web search, and three specialised AI products: LADX AI for PLC programming, SEEKOF AI for AI tool discovery, and NXTED AI for career guidance." },
  { category: "Getting Started", q: "How do I start a conversation?", a: "Simply type your question in the chat field on the homepage and press Enter or click the send button. You can also click on suggested topics or trending queries to get started quickly." },
  { category: "Getting Started", q: "Do I need an account to use Oforo?", a: "You can use Oforo AI without an account for basic conversations. Creating a free account lets you save chat history, personalise settings, and access additional features." },
  { category: "Features", q: "What is Web Search mode?", a: "When Web Search is enabled (the Globe icon in the chat input), Oforo searches the internet in real-time to provide you with up-to-date information. Results appear in tabs: Results, Links, Images, and News." },
  { category: "Features", q: "What are the different AI models?", a: "Oforo Mini is our fast lightweight model for everyday questions. Oforo Pro offers deeper analysis. Our product models — LADX AI, SEEKOF AI, and NXTED AI — are specialised for industrial automation, AI tool discovery, and career guidance respectively." },
  { category: "Features", q: "Can I change the theme/appearance?", a: "Yes! Click the palette icon in the top-right corner to cycle through 10 unique themes including Midnight, Ocean, Aurora, Ember, Forest, Snow, Peach, Lavender, Mint, and Rose. Each click surprises you with a completely new colour scheme." },
  { category: "Features", q: "What are Focus Modes?", a: "Focus Modes help direct your queries to the most relevant AI model. Choose from All, Industrial, AI Tools, Career, or Code modes to get more targeted responses." },
  { category: "Privacy & Security", q: "Is my data safe?", a: "We take your privacy seriously. Conversations are stored locally on your device by default. We do not sell your data to third parties. You can clear all data from Settings at any time." },
  { category: "Privacy & Security", q: "Are my conversations private?", a: "Your conversations are private to you. When signed in, your chat history syncs securely. You can delete individual conversations or clear everything from Settings." },
  { category: "Account & Billing", q: "What plans are available?", a: "We offer a free tier with generous usage limits. Premium plans unlock unlimited conversations, priority access to models, and advanced features. Visit the Upgrade Plan page for current pricing." },
  { category: "Account & Billing", q: "How do I upgrade my plan?", a: "Click on your profile in the sidebar, then select Upgrade Plan. You can also visit the pricing page from the footer links." },
];

const categories = Array.from(new Set(faqs.map((f) => f.category)));

export default function HelpPage() {
  const { theme } = useTheme();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = faqs.filter((f) => {
    const matchesSearch = search
      ? f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory = activeCategory === "all" || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryIcons: Record<string, React.ReactNode> = {
    "Getting Started": <BookOpen className="w-3.5 h-3.5" />,
    "Features": <Zap className="w-3.5 h-3.5" />,
    "Privacy & Security": <Shield className="w-3.5 h-3.5" />,
    "Account & Billing": <CreditCard className="w-3.5 h-3.5" />,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Help & FAQ</h1>
        </div>
        <p className="text-sm mb-6 ml-12" style={{ color: "var(--text-tertiary)" }}>Find answers to common questions about Oforo AI</p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-transparent focus:outline-none"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setActiveCategory("all")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeCategory === "all" ? "var(--accent)" : "var(--bg-secondary)",
              color: activeCategory === "all" ? "#fff" : "var(--text-secondary)",
              border: "1px solid " + (activeCategory === "all" ? "var(--accent)" : "var(--border-primary)"),
            }}>
            All
          </button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat ? "var(--accent)" : "var(--bg-secondary)",
                color: activeCategory === cat ? "#fff" : "var(--text-secondary)",
                border: "1px solid " + (activeCategory === cat ? "var(--accent)" : "var(--border-primary)"),
              }}>
              {categoryIcons[cat]}
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-2 mb-10">
          {filtered.map((faq, idx) => {
            const realIdx = faqs.indexOf(faq);
            const isOpen = openIdx === realIdx;
            return (
              <div key={realIdx} className="rounded-xl overflow-hidden transition-all"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <button onClick={() => setOpenIdx(isOpen ? null : realIdx)}
                  className="w-full flex items-center justify-between p-4 text-left transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                    <span className="text-sm font-medium">{faq.q}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 animate-fade-in">
                    <div className="ml-7 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <HelpCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No results found. Try a different search term.</p>
            </div>
          )}
        </div>

        {/* Contact section */}
        <div className="rounded-xl p-6 text-center" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
          <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--accent)" }} />
          <h3 className="font-semibold mb-1">Still need help?</h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>Our team is ready to assist you</p>
          <div className="flex items-center justify-center gap-3">
            <a href="mailto:support@oforo.com"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}>
              <Mail className="w-4 h-4" /> Email Support
            </a>
            <a href="https://www.wartens.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
              <ExternalLink className="w-4 h-4" /> Wartens
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] mt-10" style={{ color: "var(--text-tertiary)" }}>&copy; {new Date().getFullYear()} Oforo Ltd &middot; A Wartens Company</p>
      </div>
    </div>
  );
}
