import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Centre — Oforo AI Support",
  description: "Get help with Oforo AI. Find answers to frequently asked questions about features, accounts, billing, privacy, and more.",
  keywords: ["AI help", "Oforo support", "AI chatbot help"],
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
