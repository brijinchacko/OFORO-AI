"use client";

import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  Cpu,
  Factory,
  Code2,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Layers,
  Gauge,
  RefreshCw,
} from "lucide-react";

export default function LadxPage() {
  const features = [
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "Natural Language to PLC Code",
      description:
        "Describe your automation requirement in plain English. LADX generates production-ready Ladder Logic, Structured Text, FBD, or SFC code instantly.",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "Multi-Vendor Support",
      description:
        "Generate code for Siemens S7, Allen-Bradley, Mitsubishi, Schneider, Beckhoff, and more. One agent, every platform.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Safety Compliance",
      description:
        "Built-in IEC 61131-3 compliance checking. LADX validates safety-critical logic before deployment to prevent dangerous conditions.",
    },
    {
      icon: <Gauge className="w-5 h-5" />,
      title: "Real-Time Simulation",
      description:
        "Test your PLC programs in a virtual environment before deploying to hardware. Catch bugs before they reach the factory floor.",
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: "Legacy Code Migration",
      description:
        "Upload legacy PLC programs and LADX will modernise, optimise, and document them — saving weeks of manual work.",
    },
    {
      icon: <Factory className="w-5 h-5" />,
      title: "Industry Templates",
      description:
        "Pre-built templates for conveyor systems, batch processing, HVAC, robotics, packaging lines, and 200+ industrial applications.",
    },
  ];

  const useCases = [
    "Conveyor belt control systems",
    "Batch processing automation",
    "HVAC control logic",
    "Robotic arm programming",
    "Motor drive control",
    "Safety interlocking systems",
    "Water treatment plants",
    "Food & beverage production",
  ];

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-sm text-blue-400 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Industrial AI Agent
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Meet </span>
            <span className="gradient-text">LADX AI</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's first AI agent purpose-built for PLC programming.
            Turn natural language into production-ready industrial automation code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://ladx.ai"
              className="group flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all"
            >
              Visit ladx.ai
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

      {/* Code demo */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-100 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xs text-gray-500 ml-2 font-mono">
                LADX AI — Structured Text Output
              </span>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-300 font-medium mb-1">Your prompt:</p>
                <p className="text-sm text-gray-400">
                  "Create a conveyor belt control system with 3 proximity sensors,
                  an emergency stop, and automatic speed regulation based on product count"
                </p>
              </div>
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
                <code>{`PROGRAM ConveyorControl
VAR
    Sensor1, Sensor2, Sensor3 : BOOL;
    EmergencyStop              : BOOL;
    ConveyorRun                : BOOL;
    ProductCount               : INT := 0;
    ConveyorSpeed              : REAL := 50.0;
END_VAR

// Emergency stop override
IF EmergencyStop THEN
    ConveyorRun   := FALSE;
    ConveyorSpeed := 0.0;
    RETURN;
END_IF;

// Product counting logic
IF Sensor1 AND NOT Sensor1_prev THEN
    ProductCount := ProductCount + 1;
END_IF;

// Dynamic speed regulation
ConveyorSpeed := 50.0 + (ProductCount * 2.5);
IF ConveyorSpeed > 100.0 THEN
    ConveyorSpeed := 100.0;
END_IF;

ConveyorRun := TRUE;
END_PROGRAM`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Built for <span className="gradient-text">industrial engineers</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 bg-surface-100/50 border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
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

      {/* Use cases */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Use cases</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((uc) => (
              <span
                key={uc}
                className="px-4 py-2 bg-surface-100 border border-white/5 rounded-full text-sm text-gray-400"
              >
                {uc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to automate with <span className="gradient-text">LADX AI</span>?
          </h2>
          <p className="text-gray-400 mb-8">
            Start generating PLC code in seconds. Free tier available.
          </p>
          <Link
            href="https://ladx.ai"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all"
          >
            Get started at ladx.ai
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
