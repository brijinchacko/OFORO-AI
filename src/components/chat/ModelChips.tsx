"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { getModelsForTier, getModelConfig, type OforoTier } from "@/lib/models";

/* ═══════ INLINE MODEL PICKER (inside chat input) ═══════ */
export function ModelChips({ tier, selectedModel, onSelectModel }: {
  tier: OforoTier;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const models = getModelsForTier(tier);
  const current = getModelConfig(selectedModel);

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
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all"
        style={{ color: "var(--text-tertiary)" }}>
        {current.name}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 w-44 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}>
          <div className="p-1">
            {models.map((model) => {
              const isActive = selectedModel === model.id;
              return (
                <button key={model.id}
                  onClick={() => { onSelectModel(model.id); setOpen(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-[11px] transition-colors"
                  style={{
                    background: isActive ? "var(--bg-hover)" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}>
                  <span className="font-medium">{model.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
