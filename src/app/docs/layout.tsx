import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Oforo AI Platform Guide",
  description: "Comprehensive documentation for Oforo AI platform. Learn how to use our APIs, SDKs, and explore code examples.",
  keywords: ["AI documentation", "Oforo docs", "AI API docs"],
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
