"use client";

import { getModelsForTier, type OforoTier, type ModelConfig } from "@/lib/models";

/* ═══════ MODEL CHIPS (near chat input) ═══════ */
export function ModelChips({ tier, selectedModel, onSelectModel }: {
  tier: OforoTier;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}) {
  const models = getModelsForTier(tier);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {models.map((model) => {
        const isActive = selectedModel === model.id;
        return (
          <button key={model.id}
            onClick={() => onSelectModel(model.id)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap"
            style={{
              background: isActive ? "var(--bg-hover)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
              border: isActive ? "1px solid var(--border-hover)" : "1px solid var(--border-primary)",
            }}>
            {model.name}
          </button>
        );
      })}
    </div>
  );
}
