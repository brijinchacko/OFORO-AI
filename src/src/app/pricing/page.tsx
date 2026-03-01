"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Building2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

type BillingCycle = "monthly" | "annual";

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  badge?: string;
  highlighted?: boolean;
  cta: string;
  features: { text: string; included: boolean }[];
}

const plans: Plan[] = [
  {
    name: "Free",
    description: "For individuals exploring AI agents",
    monthlyPrice: 0,
    annualPrice: 0,
    cta: "Get started",
    features: [
      { text: "50 messages/day across all agents", included: true },
      { text: "Access to Oforo General model", included: true },
      { text: "Basic LADX code generation", included: true },
      { text: "SEEKOF search (10 queries/day)", included: true },
      { text: "NXTED skill assessment (1/month)", included: true },
      { text: "Community support", included: true },
      { text: "API access", included: false },
      { text: "Custom model fine-tuning", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    description: "For professionals and small teams",
    monthlyPrice: 29,
    annualPrice: 24,
    badge: "Most Popular",
    highlighted: true,
    cta: "Start Pro trial",
    features: [
      { text: "Unlimited messages across all agents", included: true },
      { text: "Oforo Pro + all specialised agents", included: true },
      { text: "Full LADX with simulation", included: true },
      { text: "Unlimited SEEKOF searches", included: true },
      { text: "NXTED unlimited assessments + paths", included: true },
      { text: "API access (100K tokens/mo)", included: true },
      { text: "Priority email support", included: true },
      { text: "Custom model fine-tuning", included: false },
      { text: "SSO & team management", included: false },
    ],
  },
  {
    name: "Team",
    description: "For growing teams and departments",
    monthlyPrice: 79,
    annualPrice: 65,
    cta: "Start Team trial",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 25 team members", included: true },
      { text: "API access (1M tokens/mo)", included: true },
      { text: "Team analytics dashboard", included: true },
      { text: "SSO & role-based access", included: true },
      { text: "Shared conversation workspace", included: true },
      { text: "Priority chat support", included: true },
      { text: "Custom model fine-tuning", included: false },
      { text: "On-premise deployment", included: false },
    ],
  },
  {
    name: "Enterprise",
    description: "For organisations needing full control",
    monthlyPrice: null,
    annualPrice: null,
    cta: "Contact sales",
    features: [
      { text: "Everything in Team", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Unlimited API access", included: true },
      { text: "Custom model fine-tuning", included: true },
      { text: "On-premise / VPC deployment", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantees (99.99%)", included: true },
      { text: "Custom integrations", included: true },
      { text: "SOC 2 compliance report", included: true },
    ],
  },
];

const apiPricing = [
  {
    model: "Oforo General",
    input: "$0.50",
    output: "$1.50",
    context: "128K",
  },
  {
    model: "Oforo Pro",
    input: "$2.50",
    output: "$7.50",
    context: "200K",
  },
  {
    model: "LADX Agent",
    input: "$1.00",
    output: "$3.00",
    context: "64K",
  },
  {
    model: "SEEKOF Agent",
    input: "$0.75",
    output: "$2.25",
    context: "128K",
  },
  {
    model: "NXTED Agent",
    input: "$0.75",
    output: "$2.25",
    context: "128K",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("annual");

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          Simple, <span className="gradient-text">transparent</span> pricing
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
          Start free. Scale as you grow. No hidden fees.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-surface-100 rounded-full p-1 border border-white/5">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 text-sm rounded-full transition-all ${
              billing === "monthly"
                ? "bg-white text-black font-medium"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-4 py-2 text-sm rounded-full transition-all ${
              billing === "annual"
                ? "bg-white text-black font-medium"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Annual
            <span className="ml-1.5 text-xs text-emerald-500 font-medium">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
                plan.highlighted
                  ? "bg-surface-100 border-blue-500/30 shadow-lg shadow-blue-500/5"
                  : "bg-surface-100/50 border-white/5 hover:border-white/10"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.monthlyPrice !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ${billing === "annual" ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold">Custom</div>
                )}
                {billing === "annual" && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Billed annually (${(plan.annualPrice! * 12).toLocaleString()}/yr)
                  </p>
                )}
              </div>

              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/chat"}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all mb-6 ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-gray-100"
                    : "border border-white/10 text-gray-300 hover:bg-white/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-start gap-2 text-sm"
                  >
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        feature.included ? "text-gray-300" : "text-gray-600"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* API Pricing */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              API <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-gray-400">
              Pay only for what you use. Volume discounts available.
            </p>
          </div>

          <div className="bg-surface-100 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    Model
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    Input (per 1M tokens)
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    Output (per 1M tokens)
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">
                    Context Window
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiPricing.map((row) => (
                  <tr key={row.model} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-sm font-medium">{row.model}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{row.input}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{row.output}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{row.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I switch between plans?",
                a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate the difference.",
              },
              {
                q: "What happens when I hit my API limit?",
                a: "We'll notify you at 80% usage. You can add more tokens on-demand or upgrade your plan. We never cut off access without warning.",
              },
              {
                q: "Do all products come with every plan?",
                a: "Yes! Every plan includes access to all three agents (LADX, SEEKOF, NXTED) plus our general models. Plans differ in usage limits, features, and support levels.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Absolutely. Pro and Team plans come with a 14-day free trial. No credit card required.",
              },
              {
                q: "Can I self-host Oforo models?",
                a: "Enterprise customers can deploy Oforo models on-premise or in their private cloud. Contact our sales team for details.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group bg-surface-100/50 border border-white/5 rounded-xl"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-medium hover:text-white text-gray-200 list-none">
                  {faq.q}
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">
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
