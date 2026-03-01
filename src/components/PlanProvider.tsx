"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type PlanTier = "free" | "pro" | "max";

export interface PlanInfo {
  tier: PlanTier;
  name: string;
  activatedAt: string;
  couponUsed?: string;
}

interface PlanContextType {
  plan: PlanTier;
  planInfo: PlanInfo;
  setPlan: (tier: PlanTier) => void;
  applyCoupon: (code: string) => { success: boolean; error?: string; plan?: PlanTier };
  canAccessModel: (modelId: string) => boolean;
  canAccessFeature: (feature: FeatureKey) => boolean;
  requiredPlanForModel: (modelId: string) => PlanTier;
  requiredPlanForFeature: (feature: FeatureKey) => PlanTier;
  showUpgradePrompt: boolean;
  upgradePromptFeature: string;
  upgradePromptPlan: PlanTier;
  triggerUpgradePrompt: (feature: string, requiredPlan: PlanTier) => void;
  dismissUpgradePrompt: () => void;
}

// Feature keys for gating
export type FeatureKey =
  | "canvas"
  | "voice"
  | "taskhub"
  | "browse_files"
  | "file_upload"
  | "web_search"
  | "circle"
  | "direct_messages"
  | "workspaces"
  | "notifications"
  | "canvas_sharing"
  | "share_thread";

// Which plan is needed for each feature
const featurePlanMap: Record<FeatureKey, PlanTier> = {
  web_search: "free",
  file_upload: "free",
  canvas: "pro",
  voice: "pro",
  taskhub: "pro",
  browse_files: "pro",
  circle: "max",
  direct_messages: "max",
  workspaces: "max",
  notifications: "max",
  canvas_sharing: "max",
  share_thread: "max",
};

// Which plan is needed for each model
const modelPlanMap: Record<string, PlanTier> = {
  "oforo-general": "free",
  "oforo-pro": "pro",
  "oforo-max": "max",
  "ladx-agent": "max",
  "seekof-agent": "max",
  "nxted-agent": "max",
};

// Valid coupon codes
const couponCodes: Record<string, PlanTier> = {
  "OFORO-PRO-TEST": "pro",
  "OFORO-MAX-TEST": "max",
  "OFORO-PRO-2026": "pro",
  "OFORO-MAX-2026": "max",
  "WARTENS-PRO": "pro",
  "WARTENS-MAX": "max",
};

const planNames: Record<PlanTier, string> = {
  free: "Mini (Free)",
  pro: "Pro",
  max: "MAX",
};

// Plan hierarchy for comparison
const planHierarchy: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  max: 2,
};

function hasAccess(userPlan: PlanTier, requiredPlan: PlanTier): boolean {
  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
}

const defaultPlanInfo: PlanInfo = {
  tier: "free",
  name: "Mini (Free)",
  activatedAt: new Date().toISOString(),
};

const PlanContext = createContext<PlanContextType>({
  plan: "free",
  planInfo: defaultPlanInfo,
  setPlan: () => {},
  applyCoupon: () => ({ success: false }),
  canAccessModel: () => false,
  canAccessFeature: () => false,
  requiredPlanForModel: () => "free",
  requiredPlanForFeature: () => "free",
  showUpgradePrompt: false,
  upgradePromptFeature: "",
  upgradePromptPlan: "pro",
  triggerUpgradePrompt: () => {},
  dismissUpgradePrompt: () => {},
});

export function usePlan() {
  return useContext(PlanContext);
}

export default function PlanProvider({ children }: { children: React.ReactNode }) {
  const [planInfo, setPlanInfo] = useState<PlanInfo>(defaultPlanInfo);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptFeature, setUpgradePromptFeature] = useState("");
  const [upgradePromptPlan, setUpgradePromptPlan] = useState<PlanTier>("pro");

  // Load plan from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("oforo-plan");
      if (stored) {
        const parsed = JSON.parse(stored) as PlanInfo;
        if (parsed.tier && planNames[parsed.tier]) {
          setPlanInfo(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const setPlan = useCallback((tier: PlanTier) => {
    const info: PlanInfo = {
      tier,
      name: planNames[tier],
      activatedAt: new Date().toISOString(),
    };
    setPlanInfo(info);
    localStorage.setItem("oforo-plan", JSON.stringify(info));
  }, []);

  const applyCoupon = useCallback((code: string): { success: boolean; error?: string; plan?: PlanTier } => {
    const normalised = code.trim().toUpperCase();
    const targetPlan = couponCodes[normalised];
    if (!targetPlan) {
      return { success: false, error: "Invalid coupon code. Please check and try again." };
    }
    // Don't downgrade
    if (planHierarchy[targetPlan] <= planHierarchy[planInfo.tier]) {
      return {
        success: false,
        error: `You already have ${planNames[planInfo.tier]} plan which includes all ${planNames[targetPlan]} features.`,
      };
    }
    const info: PlanInfo = {
      tier: targetPlan,
      name: planNames[targetPlan],
      activatedAt: new Date().toISOString(),
      couponUsed: normalised,
    };
    setPlanInfo(info);
    localStorage.setItem("oforo-plan", JSON.stringify(info));
    return { success: true, plan: targetPlan };
  }, [planInfo.tier]);

  const canAccessModel = useCallback(
    (modelId: string): boolean => {
      const required = modelPlanMap[modelId] || "free";
      return hasAccess(planInfo.tier, required);
    },
    [planInfo.tier]
  );

  const canAccessFeature = useCallback(
    (feature: FeatureKey): boolean => {
      const required = featurePlanMap[feature] || "free";
      return hasAccess(planInfo.tier, required);
    },
    [planInfo.tier]
  );

  const requiredPlanForModel = useCallback((modelId: string): PlanTier => {
    return modelPlanMap[modelId] || "free";
  }, []);

  const requiredPlanForFeature = useCallback((feature: FeatureKey): PlanTier => {
    return featurePlanMap[feature] || "free";
  }, []);

  const triggerUpgradePrompt = useCallback((feature: string, requiredPlan: PlanTier) => {
    setUpgradePromptFeature(feature);
    setUpgradePromptPlan(requiredPlan);
    setShowUpgradePrompt(true);
  }, []);

  const dismissUpgradePrompt = useCallback(() => {
    setShowUpgradePrompt(false);
  }, []);

  return (
    <PlanContext.Provider
      value={{
        plan: planInfo.tier,
        planInfo,
        setPlan,
        applyCoupon,
        canAccessModel,
        canAccessFeature,
        requiredPlanForModel,
        requiredPlanForFeature,
        showUpgradePrompt,
        upgradePromptFeature,
        upgradePromptPlan,
        triggerUpgradePrompt,
        dismissUpgradePrompt,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

// ─── Upgrade Prompt Modal ─────────────────────────────────────────
export function UpgradePrompt() {
  const { showUpgradePrompt, upgradePromptFeature, upgradePromptPlan, dismissUpgradePrompt, applyCoupon, plan } = usePlan();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  if (!showUpgradePrompt) return null;

  const planPrices: Record<PlanTier, string> = {
    free: "Free",
    pro: "£14.99/mo",
    max: "£89.99/mo",
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponSuccess(`Coupon applied! You now have ${planNames[result.plan!]} plan.`);
      setTimeout(() => {
        dismissUpgradePrompt();
        setCouponInput("");
        setCouponSuccess("");
      }, 1500);
    } else {
      setCouponError(result.error || "Invalid coupon");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={dismissUpgradePrompt}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-hover)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: upgradePromptPlan === "max" ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.15)" }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: upgradePromptPlan === "max" ? "#f59e0b" : "#a855f7" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-center mb-1" style={{ color: "var(--text-primary)" }}>
          Upgrade to {planNames[upgradePromptPlan]}
        </h3>
        <p className="text-sm text-center mb-5" style={{ color: "var(--text-tertiary)" }}>
          <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{upgradePromptFeature}</span>{" "}
          requires the {planNames[upgradePromptPlan]} plan ({planPrices[upgradePromptPlan]}).
        </p>

        {/* Plan comparison */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Current plan</span>
            <span className="text-sm px-2 py-0.5 rounded-full" style={{ background: "var(--bg-primary)", color: "var(--text-tertiary)" }}>
              {planNames[plan]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Required plan</span>
            <span
              className="text-sm px-2 py-0.5 rounded-full font-medium"
              style={{
                background: upgradePromptPlan === "max" ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.15)",
                color: upgradePromptPlan === "max" ? "#f59e0b" : "#a855f7",
              }}
            >
              {planNames[upgradePromptPlan]} — {planPrices[upgradePromptPlan]}
            </span>
          </div>
        </div>

        {/* Coupon code input */}
        <div className="mb-4">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-tertiary)" }}>
            Have a coupon code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                setCouponError("");
              }}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponInput.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: couponInput.trim() ? "var(--accent)" : "var(--bg-hover)",
                color: couponInput.trim() ? "white" : "var(--text-tertiary)",
                opacity: couponInput.trim() ? 1 : 0.5,
              }}
            >
              Apply
            </button>
          </div>
          {couponError && (
            <p className="text-xs mt-1.5 text-red-400">{couponError}</p>
          )}
          {couponSuccess && (
            <p className="text-xs mt-1.5 text-emerald-400">{couponSuccess}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={dismissUpgradePrompt}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "var(--bg-hover)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-primary)",
            }}
          >
            Maybe later
          </button>
          <a
            href="/pricing"
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-center transition-all text-white"
            style={{
              background: upgradePromptPlan === "max"
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "linear-gradient(135deg, #a855f7, #7c3aed)",
            }}
          >
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}
