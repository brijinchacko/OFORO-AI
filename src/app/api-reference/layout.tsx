import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference — Oforo AI Developer Docs",
  description: "Complete API reference documentation for Oforo AI. Learn about endpoints, models, embeddings, and integration examples.",
  keywords: ["AI API reference", "Oforo API docs", "AI endpoints"],
};

export default function ApiReferenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
