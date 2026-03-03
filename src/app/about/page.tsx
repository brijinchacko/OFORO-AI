"use client";

import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Sparkles,
  Globe,
  Target,
  Heart,
  Users,
  Lightbulb,
  Building2,
  ExternalLink,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Domain Expertise Over Generality",
      description:
        "We believe the most impactful AI is deeply specialised. Each of our agents is an expert in its field, not a jack of all trades.",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "AI That Serves People",
      description:
        "Technology exists to amplify human capability. Our agents don't replace experts — they make experts more powerful.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Global by Default",
      description:
        "Built in the UK, serving the world. Our products are designed for global accessibility from day one.",
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Transparent Innovation",
      description:
        "We publish our research, share our roadmaps, and build in public. Trust is earned through transparency.",
    },
  ];

  const milestones = [
    { year: "2024", event: "Oforo founded in Milton Keynes, UK as part of the Wartens group" },
    { year: "2024", event: "SEEKOF AI — AI discovery platform launched" },
    { year: "2025", event: "LADX AI — PLC programming agent launched" },
    { year: "2025", event: "NXTED AI — Career development agent launched" },
    { year: "2026", event: "Unified Oforo platform and API released" },
  ];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Building AI agents that{" "}
            <span className="gradient-text">actually work</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Oforo is an AI company on a mission to build domain-specialised
            intelligent agents that transform how industries operate, how people
            discover technology, and how careers are built.
          </p>
        </div>
      </section>

      {/* Wartens / Parent Company */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-8 rounded-2xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-hover)" }}>
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-1">A Wartens Company</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Oforo Ltd is a subsidiary of <strong>Wartens</strong>, a technology group focused on building innovative AI solutions.
                Wartens provides the strategic foundation and resources that enable Oforo to push the boundaries of domain-specialised artificial intelligence.
              </p>
            </div>
            <a href="https://www.wartens.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors flex-shrink-0"
              style={{ background: "var(--bg-hover)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            >
              Visit Wartens <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-medium text-blue-400 mb-3 tracking-wide uppercase">
              Our Mission
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Making AI work for every industry
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              The world doesn&apos;t need another general-purpose chatbot. It needs AI
              agents that understand the nuances of specific domains — the
              safety requirements of a PLC program, the rapidly shifting landscape
              of AI tools, or the complex journey from learning a skill to landing
              a job.
            </p>
            <p className="text-gray-400 leading-relaxed">
              That&apos;s what Oforo builds. Each of our three products is a
              deeply specialised AI agent, trained on domain-specific data and
              designed to deliver expert-level results in its field. As a company from{" "}
              <a href="https://www.wartens.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2">Wartens</a>,
              we have the backing and vision to bring this to a global scale.
            </p>
          </div>
          <div className="bg-surface-100 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">
                Milton Keynes, United Kingdom
              </span>
            </div>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-xs font-mono text-gray-600 mt-0.5 flex-shrink-0">
                    {m.year}
                  </span>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{m.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Our values
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 bg-surface-100/50 border border-white/5 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Want to join us?
          </h2>
          <p className="text-gray-400 mb-8">
            We&apos;re building the future of specialised AI. If you&apos;re passionate about
            domain-specific intelligence, we&apos;d love to talk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/careers"
              className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all"
            >
              View open roles
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="mailto:hello@oforo.com"
              className="flex items-center gap-2 px-8 py-3.5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition-all"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
