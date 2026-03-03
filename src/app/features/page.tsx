"use client";

import Link from "next/link";
import {
  Zap,
  Columns,
  Mic,
  PenTool,
  Globe,
  CheckSquare,
  FolderOpen,
  Brain,
  Shield,
  Download,
  Users,
  MessageSquare,
  ArrowRight,
  Sparkles,
  BarChart3,
  Lock,
  Eye,
  Cpu,
  Languages,
} from "lucide-react";

const coreFeatures = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Auto Model Routing",
    description:
      "Ask anything and Oforo automatically picks the best AI model for your question. Code queries go to Claude Sonnet, math to DeepSeek, creative tasks to GPT — all seamlessly.",
    color: "#f59e0b",
    tag: "Smart",
  },
  {
    icon: <Columns className="w-6 h-6" />,
    title: "Side-by-Side Comparison",
    description:
      "Compare responses from 2-3 AI models at once. Send the same prompt to GPT, Claude, Gemini, and DeepSeek to see which gives you the best answer.",
    color: "#8b5cf6",
    tag: "Unique",
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Voice Mode",
    description:
      "Talk to AI naturally. Voice Mode transcribes your speech, sends it to the AI, and reads the response aloud. Save voice conversations as threads for later.",
    color: "#ef4444",
    tag: "Hands-free",
  },
  {
    icon: <PenTool className="w-6 h-6" />,
    title: "Canvas Whiteboard",
    description:
      "Sketch diagrams, mind maps, and flowcharts right inside the chat. AI-generated Mermaid diagrams render automatically on the canvas.",
    color: "#3b82f6",
    tag: "Visual",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Web Search Integration",
    description:
      "Toggle web search to ground AI responses with real-time data. Search results appear as cited sources alongside the answer with images.",
    color: "#10b981",
    tag: "Real-time",
  },
  {
    icon: <CheckSquare className="w-6 h-6" />,
    title: "Task Hub & Scheduler",
    description:
      "AI automatically detects tasks from your conversations and adds them to your Task Hub. Set scheduled queries that run daily and notify you with results.",
    color: "#06b6d4",
    tag: "Productivity",
  },
];

const additionalFeatures = [
  {
    icon: <FolderOpen className="w-5 h-5" />,
    title: "Local File Browser",
    description: "Browse your local file system and let AI analyze your files — right from the chat.",
    color: "#f97316",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Personalized Learning",
    description: "Oforo learns your interests, knowledge level, and preferred response style over time.",
    color: "#ec4899",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Import from ChatGPT",
    description: "Bring your ChatGPT conversation history into Oforo. No lock-in, ever.",
    color: "#22c55e",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Friends & Collaboration",
    description: "Add friends, share chat threads, co-edit on whiteboards, and message — all within the AI platform.",
    color: "#3b82f6",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Direct Messages",
    description: "Chat with friends inside Oforo, share AI-generated insights, and collaborate in real time.",
    color: "#6366f1",
  },
  {
    icon: <Languages className="w-5 h-5" />,
    title: "Multi-Language Support",
    description: "Switch Oforo's response language to Spanish, French, German, Hindi, Malayalam, and 15+ more.",
    color: "#14b8a6",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "File & Image Analysis",
    description: "Upload PDFs, CSVs, images, and documents. AI reads and analyzes them instantly.",
    color: "#a855f7",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "8+ AI Models",
    description: "Access GPT-4o, Claude Sonnet, Gemini Flash, DeepSeek V3, Llama, Mistral — and more to come.",
    color: "#64748b",
  },
];

const modelTiers = [
  {
    name: "Free",
    description: "Open-source models for everyday use",
    models: ["Llama 3.3 70B", "Mistral Small"],
    color: "#22c55e",
  },
  {
    name: "Mini",
    description: "Fast, capable models for most tasks",
    models: ["Gemini 2.0 Flash", "DeepSeek V3"],
    color: "#3b82f6",
  },
  {
    name: "Pro",
    description: "Premium models for complex tasks",
    models: ["GPT-4o Mini", "Claude Sonnet 4"],
    color: "#a855f7",
  },
  {
    name: "Max",
    description: "The most powerful AI models available",
    models: ["GPT-4o", "Claude Sonnet 4", "Full collaboration suite"],
    color: "#f59e0b",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Sparkles className="w-3.5 h-3.5" />
            Everything in one place
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            All the features you need,
            <br />
            <span style={{ color: "var(--accent)" }}>none you don&apos;t</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Oforo brings together the best AI models, productivity tools, and collaboration features — so you can think faster, create better, and work smarter.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link href="/"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "var(--accent)", color: "white" }}>
              Try it free
            </Link>
            <Link href="/pricing"
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Core Features</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "var(--text-tertiary)" }}>
            What makes Oforo different from every other AI chat
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl" style={{ background: `${f.color}15`, color: f.color }}>
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${f.color}15`, color: f.color }}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Tiers */}
      <section className="py-16 px-4" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Choose Your Tier</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "var(--text-tertiary)" }}>
            From free open-source models to the most powerful AI available
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modelTiers.map((tier) => (
              <div key={tier.name} className="p-5 rounded-xl"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: tier.color }} />
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>{tier.description}</p>
                <ul className="space-y-2">
                  {tier.models.map((m) => (
                    <li key={m} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <BarChart3 className="w-3 h-3 flex-shrink-0" style={{ color: tier.color }} />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">And so much more</h2>
          <p className="text-center mb-12 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Tools and integrations that make Oforo your complete AI workspace
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalFeatures.map((f) => (
              <div key={f.title} className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
                <div className="p-2 rounded-lg w-fit mb-3" style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="py-16 px-4" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-3 rounded-xl w-fit mx-auto mb-4" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Privacy you can trust</h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Your conversations stay on your device. No ads, no data selling, no lock-in.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: <Lock className="w-4 h-4" />, title: "No Ads, Ever", desc: "We make money from subscriptions, not your data." },
              { icon: <Download className="w-4 h-4" />, title: "Export Anytime", desc: "Your conversations are yours. Import or export freely." },
              { icon: <Eye className="w-4 h-4" />, title: "Local-First Data", desc: "Conversations stored in your browser. We don't read them." },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "#22c55e" }}>{item.icon}</span>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to try the smarter AI?</h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Start chatting for free. No credit card required. Upgrade when you need more.
          </p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "var(--accent)", color: "white" }}>
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
