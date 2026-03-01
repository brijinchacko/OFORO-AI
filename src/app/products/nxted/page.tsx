"use client";

import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Brain,
  Target,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Briefcase,
  BarChart3,
} from "lucide-react";

export default function NxtedPage() {
  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI Skill Assessment",
      description:
        "Adaptive assessments that accurately map your current skills across technical, soft, and domain-specific competencies using AI-powered evaluation.",
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Personalised Learning Paths",
      description:
        "Dynamic learning journeys that adapt to your pace, preferences, and goals. Curated from the best courses, tutorials, and projects worldwide.",
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      title: "Direct Employer Matching",
      description:
        "Our AI matches your verified skills and growth trajectory with employer requirements, connecting you with opportunities that truly fit.",
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Verified Certifications",
      description:
        "Earn blockchain-verified credentials that employers trust. Each certification maps to specific industry skill requirements.",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Progress Analytics",
      description:
        "Real-time dashboards tracking your skill growth, learning velocity, and market readiness with predictive career trajectory modelling.",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Mentorship Network",
      description:
        "AI-matched mentors from your target industry. Get guidance from professionals who've walked the path you're on.",
    },
  ];

  const journeySteps = [
    {
      step: "01",
      title: "Assess",
      description: "AI evaluates your current skills and identifies gaps",
    },
    {
      step: "02",
      title: "Plan",
      description: "Receive a personalised learning path tailored to your goals",
    },
    {
      step: "03",
      title: "Learn",
      description: "Follow your adaptive path with curated content and projects",
    },
    {
      step: "04",
      title: "Certify",
      description: "Earn verified credentials that employers recognise",
    },
    {
      step: "05",
      title: "Connect",
      description: "Get matched with employers seeking your specific skills",
    },
  ];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-sm text-cyan-400 mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            Career AI Agent
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Your AI </span>
            <span className="gradient-text">career coach</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            NXTED AI assesses your skills, builds personalised learning paths,
            and guides you from training to employment — all powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://nxted.ai"
              className="group flex items-center gap-2 px-8 py-3.5 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-500 transition-all"
            >
              Visit nxted.ai
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-8 py-3.5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Try in chat
            </Link>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            From skills to <span className="gradient-text">employment</span>
          </h2>
          <div className="space-y-4">
            {journeySteps.map((step, i) => (
              <div
                key={step.step}
                className="flex items-start gap-6 p-5 bg-surface-100/50 border border-white/5 rounded-xl hover:border-cyan-500/20 transition-all"
              >
                <span className="text-3xl font-bold text-cyan-500/30 font-mono flex-shrink-0">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill assessment demo */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-surface-100 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Sample Skill Assessment — Data Science
            </h3>
            <div className="space-y-4">
              {[
                { skill: "Python Programming", level: 85, color: "bg-cyan-500" },
                { skill: "Machine Learning", level: 62, color: "bg-blue-500" },
                { skill: "Data Visualisation", level: 78, color: "bg-purple-500" },
                { skill: "Statistical Analysis", level: 55, color: "bg-emerald-500" },
                { skill: "Deep Learning", level: 40, color: "bg-orange-500" },
              ].map((item) => (
                <div key={item.skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.skill}</span>
                    <span className="text-gray-500">{item.level}%</span>
                  </div>
                  <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
              <p className="text-sm text-cyan-300 font-medium">AI Recommendation:</p>
              <p className="text-sm text-gray-400 mt-1">
                Focus on Statistical Analysis and Deep Learning to unlock Senior Data
                Scientist roles. Estimated time: 12 weeks with your current pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Everything you need for{" "}
            <span className="gradient-text">career growth</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 bg-surface-100/50 border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
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
            Start your journey with{" "}
            <span className="gradient-text">NXTED AI</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Free skill assessment. Personalised learning path. Your career, accelerated.
          </p>
          <Link
            href="https://nxted.ai"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all"
          >
            Get started at nxted.ai
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
