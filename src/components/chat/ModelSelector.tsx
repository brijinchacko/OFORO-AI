"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePlan } from "@/components/PlanProvider";
import {
  Sparkles,
  Brain,
  Crown,
  Check,
  ChevronDown,
  Lock,
} from "lucide-react";
import { oforoTiers, type OforoTier } from "@/lib/models";

const tierIcons: Record<OforoTier, React.ReactNode> = {
  mini: <Sparkles className="w-3.5 h-3.5" />,
  pro: <Brain className="w-3.5 h-3.5" />,
  max: <Crown className="w-3.5 h-3.5" />,
};

/* ═══════ TIER SELECTOR (top bar) ═══════ */
export function ModelSelector({ selected, onSelect }: {
  selected: OforoTier; onSelect: (tier: OforoTier) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { canAccessModel, triggerUpgradePrompt } = usePlan();
  const currentTier = oforoTiers.find((t) => t.id === selected) || oforoTiers[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        style={{ border: "1px solid var(--border-primary)" }}>
        <span style={{ color: currentTier.color }}>{tierIcons[currentTier.id]}</span>
        <span className="font-medium">{currentTier.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
          <div className="p-1.5">
            {oforoTiers.map((tier) => {
              const isPremium = tier.id === "pro" || tier.id === "max";
              const needsAuth = !user && isPremium;
              const lockedByPlan = !!user && !canAccessModel(
                tier.id === "pro" ? "gpt-4o" : tier.id === "max" ? "claude-opus" : "gemini-flash"
              );
              const locked = needsAuth || lockedByPlan;
              return (
                <button key={tier.id}
                  onClick={() => {
                    if (needsAuth) {
                      window.location.href = "/auth";
                      setOpen(false);
                      return;
                    }
                    if (lockedByPlan) {
                      triggerUpgradePrompt(tier.name, tier.planRequired as "free" | "pro" | "max");
                      setOpen(false);
                      return;
                    }
                    onSelect(tier.id); setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors"
                  style={{ background: selected === tier.id ? "var(--bg-hover)" : "transparent", opacity: locked ? 0.5 : 1 }}>
                  <span style={{ color: tier.color }}>{tierIcons[tier.id]}</span>
                  <div className="flex-1 text-left">
                    <span className="text-xs font-medium">{tier.name}</span>
                    <span className="text-[10px] ml-1.5" style={{ color: "var(--text-tertiary)" }}>{tier.description}</span>
                  </div>
                  {locked && (
                    <Lock className="w-3 h-3 flex-shrink-0" style={{ color: tier.color }} />
                  )}
                  {selected === tier.id && !locked && <Check className="w-3 h-3 flex-shrink-0 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
