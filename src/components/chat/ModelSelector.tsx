"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePlan } from "@/components/PlanProvider";
import { ChevronDown, Lock, Check } from "lucide-react";
import { oforoTiers, getModelsForTier, type OforoTier } from "@/lib/models";

/* ═══════ TIER SELECTOR (top bar) — minimal, with model names ═══════ */
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
        <span className="font-medium">{currentTier.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
          <div className="p-1.5">
            {oforoTiers.map((tier) => {
              const isPremium = tier.id === "pro" || tier.id === "max";
              const needsAuth = !user && isPremium;
              const lockedByPlan = !!user && !canAccessModel(
                tier.id === "pro" ? "gpt-4o" : tier.id === "max" ? "claude-opus" : "gemini-flash"
              );
              const locked = needsAuth || lockedByPlan;
              const models = getModelsForTier(tier.id);
              // Show only the models unique to this tier (not inherited from lower tiers)
              const tierOwnModels = tier.id === "mini"
                ? models
                : tier.id === "pro"
                  ? models.filter(m => m.tier === "pro")
                  : models.filter(m => m.tier === "max");

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
                  className="w-full text-left px-3 py-2 rounded-md transition-colors"
                  style={{ background: selected === tier.id ? "var(--bg-hover)" : "transparent", opacity: locked ? 0.5 : 1 }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{tier.name}</span>
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{tier.description}</span>
                    </div>
                    {locked && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />}
                    {selected === tier.id && !locked && <Check className="w-3 h-3 flex-shrink-0 text-blue-500" />}
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {tier.id === "mini" && "All models: "}
                    {tier.id === "pro" && "+ "}
                    {tier.id === "max" && "+ "}
                    {tierOwnModels.map(m => m.name).join(", ")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
