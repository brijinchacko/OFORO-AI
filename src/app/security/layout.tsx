import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — How We Protect Your Data",
  description: "Learn how Oforo AI protects your data with encryption, GDPR compliance, and SOC 2 Type II certification.",
  keywords: ["AI security", "data protection", "Oforo security"],
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
