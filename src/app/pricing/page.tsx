"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Crown,
  Brain,
  Ticket,
} from "lucide-react";
import { usePlan, PlanTier } from "@/components/PlanProvider";

type BillingCycle = "monthly" | "annual";

interface PlanCard {
  tier: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  badge?: string;
  highlighted?: boolean;
  icon: React.ReactNode;
  iconColor: string;
  cta: string;
  features: { text: string; included: boolean }[];
}

const plans: PlanCard[] = [
  {
    tier: "free",
    name: "Mini",
    description: "For individuals exploring Oforo AI",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: <Sparkles className="w-5 h-5" />,
    iconColor: "#3b82f6",
    cta: "Get started free",
    features: [
      { text: "50 messages/day", included: true },
      { text: "Oforo Mini model", included: true },
      { text: "Basic web search", included: true },
      { text: "File uploads", included: true },
      { text: "Community support", included: true },
      { text: "Oforo Pro model", included: false },
      { text: "Canvas & Voice chat", included: false },
      { text: "Task Hub & Scheduled queries", included: false },
      { text: "LADX / SEEKOF / NXTED agents", included: false },
      { text: "Circle & Collaboration", included: false },
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    description: "For professionals who need advanced AI",
    monthlyPrice: 14.99,
    annualPrice: 11.99,
    badge: "Most Popular",
    highlighted: true,
    icon: <Brain className="w-5 h-5" />,
    iconColor: "#a855f7",
    cta: "Start Pro trial",
    features: [
      { text: "Unlimited messages", included: true },
      { text: "Oforo Mini + Pro models", included: true },
      { text: "Advanced web search", included: true },
      { text: "Canvas whiteboard & diagrams", included: true },
      { text: "Voice chat conversations", included: true },
      { text: "Task Hub & scheduled queries", included: true },
      { text: "File browser & uploads", included: true },
      { text: "Priority email support", included: true },
      { text: "LADX / SEEKOF / NXTED agents", included: false },
      { text: "Circle & Collaboration", included: false },
    ],
  },
  {
    tier: "max",
    name: "MAX",
    description: "Everything in Pro + collaboration & all agents",
    monthlyPrice: 89.99,
    annualPrice: 71.99,
    badge: "All Access",
    icon: <Crown className="w-5 h-5" />,
    iconColor: "#f59e0b",
    cta: "Start MAX trial",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Oforo MAX collaborative model", included: true },
      { text: "LADX AI — PLC & automation agent", included: true },
      { text: "SEEKOF AI — AI tool discovery agent", included: true },
      { text: "NXTED AI — Career guidance agent", included: true },
      { text: "Circle — add coworkers & connections", included: true },
      { text: "Real-time direct messaging", included: true },
      { text: "Shared AI workspaces", included: true },
      { text: "Canvas sharing & collaboration", included: true },
      { text: "Priority chat & phone support", included: true },
    ],
  },
];

const apiPricing = [
  { model: "Oforo Mini", input: "£0.40", output: "£1.20", context: "128K" },
  { model: "Oforo Pro", input: "£2.00", output: "£6.00", context: "200K" },
  { model: "Oforo MAX", input: "£2.00", output: "£6.00", context: "200K" },
  { model: "LADX Agent", input: "£0.80", output: "£2.40", context: "64K" },
  { model: "SEEKOF Agent", input: "£0.60", output: "£1.80", context: "128K" },
  { model: "NXTED Agent", input: "£0.60", output: "£1.80", context: "128K" },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const { plan: currentPlan, applyCoupon, setPlan } = usePlan();
  const [couponInput, setCouponInput] = useState("");
  const planHierarchy: Record<string, number> = { free: 0, pro: 1, max: 2 };
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApplyCoupon = () => {
    setCouponMsg(null);
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponMsg({ type: "success", text: `Coupon applied! You now have the ${result.plan === "max" ? "MAX" : "Pro"} plan.` });
      setCouponInput("");
    } else {
      setCouponMsg({ type: "error", text: result.error || "Invalid coupon" });
    }
  };

  return (
    <div className="pt-24" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          Simple, <span className="gradient-text">transparent</span> pricing
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "var(--text-tertiary)" }}>
          Start free. Scale as you grow. No hidden fees.
        </p>

        {/* Billing toggle */}
        <div
          className="inline-flex items-center rounded-full p-1"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
        >
          <button
            onClick={() => setBilling("monthly")}
            className="px-4 py-2 text-sm rounded-full transition-all"
            style={{
              background: billing === "monthly" ? "var(--accent)" : "transparent",
              color: billing === "monthly" ? "white" : "var(--text-tertiary)",
              fontWeight: billing === "monthly" ? 600 : 400,
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className="px-4 py-2 text-sm rounded-full transition-all"
            style={{
              background: billing === "annual" ? "var(--accent)" : "transparent",
              color: billing === "annual" ? "white" : "var(--text-tertiary)",
              fontWeight: billing === "annual" ? 600 : 400,
            }}
          >
            Annual
            <span className="ml-1.5 text-xs text-emerald-400 font-semibold">Save 20%</span>
          </button>
        </div>

        {/* Current plan indicator */}
        {currentPlan !== "free" && (
          <div className="mt-4">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
              style={{
                background: currentPlan === "max" ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.15)",
                color: currentPlan === "max" ? "#f59e0b" : "#a855f7",
              }}
            >
              <Check className="w-3 h-3" />
              You are on the {currentPlan === "max" ? "MAX" : "Pro"} plan
            </span>
          </div>
        )}
      </section>

      {/* Plans */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan =
              (plan.tier === "free" && currentPlan === "free") ||
              plan.tier === currentPlan;
            const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className="relative flex flex-col p-6 rounded-2xl transition-all"
                style={{
                  background: plan.highlighted ? "var(--bg-elevated)" : "var(--bg-secondary)",
                  border: plan.highlighted
                    ? `1px solid ${plan.iconColor}33`
                    : "1px solid var(--border-primary)",
                  boxShadow: plan.highlighted ? `0 8px 32px ${plan.iconColor}10` : undefined,
                }}
              >
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium text-white rounded-full"
                    style={{
                      background: plan.tier === "max"
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : plan.highlighted
                        ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                        : "var(--accent)",
                    }}
                  >
                    {plan.badge}
                  </span>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: plan.iconColor }}>{plan.icon}</span>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                </div>
                <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-5">
                  {price === 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">Free</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">£{price}</span>
                        <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>/month</span>
                      </div>
                      {billing === "annual" && (
                        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                          Billed annually (£{(price * 12).toFixed(2)}/yr)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <div
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium mb-6"
                    style={{ background: "var(--bg-hover)", color: "var(--text-tertiary)", border: "1px solid var(--border-primary)" }}
                  >
                    <Check className="w-4 h-4" />
                    Current Plan
                  </div>
                ) : planHierarchy[plan.tier] > planHierarchy[currentPlan] ? (
                  <Link
                    href="/chat"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all mb-6 text-white"
                    style={{
                      background: plan.highlighted
                        ? `linear-gradient(135deg, ${plan.iconColor}, ${plan.iconColor}cc)`
                        : "var(--accent)",
                    }}
                  >
                    Upgrade to {plan.name}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to downgrade to the ${plan.name} plan? You may lose access to some features.`)) {
                        setPlan(plan.tier);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all mb-6"
                    style={{
                      background: "transparent",
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    Downgrade to {plan.name}
                  </button>
                )}

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)", opacity: 0.4 }} />
                      )}
                      <span style={{ color: feature.included ? "var(--text-secondary)" : "var(--text-tertiary)", opacity: feature.included ? 1 : 0.5 }}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Coupon Code Section */}
      <section className="py-16 px-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Ticket className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2 className="text-xl font-bold">Have a coupon code?</h2>
          </div>
          <p className="text-sm mb-5" style={{ color: "var(--text-tertiary)" }}>
            Enter your coupon code to unlock a plan instantly.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                setCouponMsg(null);
              }}
              placeholder="e.g. OFORO-PRO-TEST"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
              onKeyDown={(e) => e.key === "Enter" && couponInput.trim() && handleApplyCoupon()}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponInput.trim()}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all text-white"
              style={{
                background: couponInput.trim() ? "var(--accent)" : "var(--bg-hover)",
                opacity: couponInput.trim() ? 1 : 0.5,
              }}
            >
              Apply
            </button>
          </div>
          {couponMsg && (
            <p className={`text-sm mt-3 ${couponMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {couponMsg.text}
            </p>
          )}
        </div>
      </section>

      {/* API Pricing */}
      <section className="py-16 px-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              API <span className="gradient-text">pricing</span>
            </h2>
            <p style={{ color: "var(--text-tertiary)" }}>
              Pay only for what you use. Volume discounts available.
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>Model</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>Input (per 1M tokens)</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>Output (per 1M tokens)</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>Context Window</th>
                </tr>
              </thead>
              <tbody>
                {apiPricing.map((row) => (
                  <tr key={row.model} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <td className="px-6 py-4 text-sm font-medium">{row.model}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-tertiary)" }}>{row.input}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-tertiary)" }}>{row.output}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-tertiary)" }}>{row.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Can I switch between plans?",
                a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we prorate the difference.",
              },
              {
                q: "What happens when I hit my message limit on the Free plan?",
                a: "You will be prompted to upgrade to Pro or MAX. We never cut off access without warning.",
              },
              {
                q: "Do LADX, SEEKOF, and NXTED come with the Pro plan?",
                a: "No, the specialised agents (LADX AI, SEEKOF AI, NXTED AI) are exclusive to the MAX plan. Pro gives you access to Oforo Mini and Oforo Pro models with all core features.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes! Pro and MAX plans come with a 14-day free trial. No credit card required.",
              },
              {
                q: "What is included in the MAX plan collaboration features?",
                a: "MAX includes Circle (your professional network), real-time direct messaging, shared AI workspaces for team collaboration, canvas sharing, and access to all specialised agents.",
              },
              {
                q: "Can I use a coupon code?",
                a: "Yes, enter your coupon code on this page or in the upgrade prompt within the app to instantly activate your plan.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                <summary
                  className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-medium list-none"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {faq.q}
                  <span className="group-open:rotate-45 transition-transform text-lg" style={{ color: "var(--text-tertiary)" }}>
                    +
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
